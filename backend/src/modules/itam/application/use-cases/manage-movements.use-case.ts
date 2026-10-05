import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetMovementTypeOrmEntity } from '../../infrastructure/persistence/entities/asset-movement.typeorm.entity';
import { AssetTypeOrmEntity } from '../../infrastructure/persistence/entities/asset.typeorm.entity';
import { CreateMovementDto } from '../dtos/itam-extended.dto';

@Injectable()
export class ManageMovementsUseCase {
  constructor(
    @InjectRepository(AssetMovementTypeOrmEntity)
    private readonly movementRepo: Repository<AssetMovementTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async listMovements(assetId?: string): Promise<AssetMovementTypeOrmEntity[]> {
    if (assetId) {
      return this.getByAssetId(assetId);
    }
    return this.movementRepo.find({
      relations: ['asset', 'fromPerson', 'toPerson'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAll(): Promise<AssetMovementTypeOrmEntity[]> {
    return this.listMovements();
  }

  async getByAssetId(assetId: string): Promise<AssetMovementTypeOrmEntity[]> {
    return this.movementRepo.find({
      where: { assetId },
      relations: ['asset', 'fromPerson', 'toPerson'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMovementById(id: string): Promise<AssetMovementTypeOrmEntity> {
    const mov = await this.movementRepo.findOne({
      where: { id },
      relations: ['asset', 'fromPerson', 'toPerson'],
    });
    if (!mov) throw new NotFoundException('Movimiento no encontrado');
    return mov;
  }

  async getById(id: string): Promise<AssetMovementTypeOrmEntity> {
    return this.getMovementById(id);
  }

  async getMovementByActaNumber(actaNumber: string): Promise<AssetMovementTypeOrmEntity> {
    const mov = await this.movementRepo.findOne({
      where: { actaNumber: actaNumber.trim() },
      relations: ['asset', 'fromPerson', 'toPerson'],
    });
    if (!mov) throw new NotFoundException(`Acta de movimiento "${actaNumber}" no encontrada`);
    return mov;
  }

  async createMovement(dto: CreateMovementDto): Promise<AssetMovementTypeOrmEntity> {
    const asset = await this.assetRepo.findOne({
      where: { id: dto.assetId },
      relations: ['childAssets'],
    });
    if (!asset) throw new NotFoundException('Activo no encontrado');

    const year = new Date().getFullYear();
    const count = await this.movementRepo.count();
    const nextSeq = String(count + 1).padStart(4, '0');
    const actaNumber = `ACTA-MOV-${year}-${nextSeq}`;

    const movement = this.movementRepo.create({
      actaNumber,
      assetId: asset.id,
      fromOffice: asset.office,
      toOffice: dto.toOffice,
      fromPersonId: asset.assignedPersonId,
      toPersonId: dto.toPersonId || null,
      movementDate: new Date().toISOString().split('T')[0],
      movementType: dto.movementType || 'TRANSFERENCIA',
      reason: dto.reason,
      technicianName: dto.technicianName || 'Técnico ODT',
      includeChildrenInTransfer: Boolean(dto.includeChildrenInTransfer ?? dto.cascadeChildren),
      notes: dto.notes || (dto.newCustodianName ? `Custodio: ${dto.newCustodianName}` : null),
    });

    const savedMovement = await this.movementRepo.save(movement);

    // Update parent asset location and custodian
    asset.office = dto.toOffice;
    asset.assignedPersonId = dto.toPersonId || null;
    await this.assetRepo.save(asset);

    // RF-05: If parent asset changes location, move child components in batch optionally
    const shouldCascade = Boolean(dto.includeChildrenInTransfer ?? dto.cascadeChildren);
    if (shouldCascade && asset.childAssets && asset.childAssets.length > 0) {
      for (const child of asset.childAssets) {
        child.office = dto.toOffice;
        child.assignedPersonId = dto.toPersonId || null;
        await this.assetRepo.save(child);
      }
    }

    return this.getMovementById(savedMovement.id);
  }

  async create(dto: CreateMovementDto): Promise<AssetMovementTypeOrmEntity> {
    return this.createMovement(dto);
  }
}
