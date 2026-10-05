import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PersonEntity } from '../../infrastructure/persistence/entities/person.entity';
import { UserEntity } from '../../../auth/infrastructure/persistence/entities/user.entity';
import { AssetTypeOrmEntity } from '../../../../modules/itam/infrastructure/persistence/entities/asset.typeorm.entity';
import { AssetMovementTypeOrmEntity } from '../../../../modules/itam/infrastructure/persistence/entities/asset-movement.typeorm.entity';
import {
  CeasePersonDto,
  PersonCessationInfoItem,
  CeasePersonResult,
} from '../dtos/cease-person.dto';

const DEFAULT_WAREHOUSE_OFFICE =
  'SUBGERENCIA DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES - ALMACÉN TI';

@Injectable()
export class CeasePersonUseCase {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepository: Repository<AssetTypeOrmEntity>,
    @InjectRepository(AssetMovementTypeOrmEntity)
    private readonly movementRepository: Repository<AssetMovementTypeOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene la radiografía previa de una persona para el proceso de cese:
   * Datos personales, cuenta de usuario del sistema y activos ITAM en custodia.
   */
  async getCessationInfo(personId: string): Promise<PersonCessationInfoItem> {
    const person = await this.personRepository.findOne({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException(`Persona con ID ${personId} no encontrada`);
    }

    // Buscar cuenta de usuario vinculada
    let userAccount = await this.userRepository.findOne({
      where: { personId: person.id },
    });

    if (!userAccount && person.email) {
      userAccount = await this.userRepository.findOne({
        where: { email: person.email },
      });
    }

    // Buscar activos tecnológicos bajo su custodia
    const assets = await this.assetRepository.find({
      where: { assignedPersonId: person.id },
      relations: ['category', 'brand', 'model'],
      order: { computerCode: 'ASC' },
    });

    return {
      person: {
        id: person.id,
        fullName: `${person.firstName} ${person.paternalSurname} ${person.maternalSurname || ''}`.trim(),
        documentType: person.documentType,
        documentNumber: person.documentNumber,
        type: person.type,
        position: person.position,
        office: person.office,
        laborCondition: person.laborCondition,
        laborStatus: person.laborStatus || (person.isActive ? 'ACTIVO' : 'CESADO'),
        isActive: person.isActive,
        entryDate: person.entryDate,
      },
      userAccount: userAccount
        ? {
            id: userAccount.id,
            username: userAccount.username,
            fullName: userAccount.fullName,
            role: userAccount.role,
            isActive: userAccount.isActive,
          }
        : null,
      assignedAssets: assets.map((a) => ({
        id: a.id,
        computerCode: a.computerCode,
        patrimonialCode: a.patrimonialCode,
        categoryName: a.category?.name || 'Categoría General',
        brandName: a.brand?.name || 'Genérica',
        modelName: a.model?.name || 'Estándar',
        status: a.status,
        office: a.office,
      })),
    };
  }

  /**
   * Ejecuta el cese laboral y la entrega de cargo institucional:
   * 1. Actualiza core_people (labor_status='CESADO', departure_date, cessation_reason, is_active=false).
   * 2. Desactiva inmediatamente la cuenta en core_users (is_active=false).
   * 3. Desvincula y retorna a almacén los activos en itam_assets, registrando actas oficiales en itam_asset_movements.
   */
  async execute(personId: string, dto: CeasePersonDto): Promise<CeasePersonResult> {
    return this.dataSource.transaction(async (manager) => {
      const personRepo = manager.getRepository(PersonEntity);
      const userRepo = manager.getRepository(UserEntity);
      const assetRepo = manager.getRepository(AssetTypeOrmEntity);
      const movementRepo = manager.getRepository(AssetMovementTypeOrmEntity);

      const person = await personRepo.findOne({
        where: { id: personId },
      });

      if (!person) {
        throw new NotFoundException(`Persona con ID ${personId} no encontrada`);
      }

      if (person.type !== 'PERSONAL') {
        throw new BadRequestException(
          'Solo se puede procesar el cese laboral para registros clasificados como PERSONAL MUNICIPAL',
        );
      }

      if (person.laborStatus === 'CESADO') {
        throw new BadRequestException(
          `El servidor municipal ya se encuentra con estado CESADO con fecha ${person.departureDate || 'previa'}`,
        );
      }

      // 1. Actualizar Persona
      person.laborStatus = 'CESADO';
      person.isActive = false;
      person.departureDate = dto.departureDate;
      person.cessationReason = dto.cessationReason.trim().toUpperCase();
      await personRepo.save(person);

      // 2. Desactivar Cuenta de Usuario del Sistema
      let userDeactivated = false;
      if (dto.deactivateUser !== false) {
        const users = await userRepo.find({
          where: [{ personId: person.id }, { email: person.email || '' }],
        });

        for (const u of users) {
          if (u.isActive) {
            u.isActive = false;
            await userRepo.save(u);
            userDeactivated = true;
          }
        }
      }

      // 3. Entrega de Cargo de Activos TI (Retorno a Almacén)
      const actasGenerated: string[] = [];
      let returnedAssetsCount = 0;

      if (dto.returnAssetsToWarehouse !== false) {
        const assetsInCustody = await assetRepo.find({
          where: { assignedPersonId: person.id },
        });

        if (assetsInCustody.length > 0) {
          const year = new Date().getFullYear();
          const baseCount = await movementRepo.count();
          const targetOffice = dto.warehouseOffice?.trim() || DEFAULT_WAREHOUSE_OFFICE;
          const technician = dto.authorizedBy?.trim() || 'ADMINISTRACIÓN CENTRAL / TI';

          for (let i = 0; i < assetsInCustody.length; i++) {
            const asset = assetsInCustody[i];
            const nextSeq = String(baseCount + i + 1).padStart(4, '0');
            const actaNumber = `ACTA-CESE-${year}-${nextSeq}`;

            // Crear movimiento de auditoría
            const movement = movementRepo.create({
              actaNumber,
              assetId: asset.id,
              fromOffice: asset.office || person.office || 'OFICINA DE ORIGEN',
              toOffice: targetOffice,
              fromPersonId: person.id,
              toPersonId: null,
              movementDate: dto.departureDate,
              movementType: 'DEVOLUCION_ALMACEN',
              reason: `ENTREGA DE CARGO POR CESE LABORAL - ${dto.cessationReason.toUpperCase()}`,
              technicianName: technician,
              notes: dto.notes
                ? `${dto.notes.trim()} (Acta generada por cese de personal)`
                : 'Recepción y retorno automático a almacén por cese laboral del custodio.',
              includeChildrenInTransfer: true,
            });

            await movementRepo.save(movement);
            actasGenerated.push(actaNumber);

            // Actualizar activo: libre de custodio y en almacén
            asset.assignedPersonId = null;
            asset.office = targetOffice;
            asset.status = 'DISPONIBLE';
            await assetRepo.save(asset);

            returnedAssetsCount++;
          }
        }
      }

      const fullName = `${person.firstName} ${person.paternalSurname} ${person.maternalSurname || ''}`.trim();

      return {
        personId: person.id,
        fullName,
        laborStatus: person.laborStatus,
        departureDate: person.departureDate!,
        cessationReason: person.cessationReason!,
        userDeactivated,
        returnedAssetsCount,
        actasGenerated,
      };
    });
  }
}
