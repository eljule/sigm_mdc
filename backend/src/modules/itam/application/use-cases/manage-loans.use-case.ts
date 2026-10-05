import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AssetLoanTypeOrmEntity } from '../../infrastructure/persistence/entities/asset-loan.typeorm.entity';
import { AssetLoanItemTypeOrmEntity } from '../../infrastructure/persistence/entities/asset-loan-item.typeorm.entity';
import { AssetTypeOrmEntity } from '../../infrastructure/persistence/entities/asset.typeorm.entity';
import { CreateAssetLoanDto, ReturnAssetLoanDto } from '../dtos/itam-extended.dto';

@Injectable()
export class ManageLoansUseCase {
  constructor(
    @InjectRepository(AssetLoanTypeOrmEntity)
    private readonly loanRepo: Repository<AssetLoanTypeOrmEntity>,
    @InjectRepository(AssetLoanItemTypeOrmEntity)
    private readonly loanItemRepo: Repository<AssetLoanItemTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async listLoans(status?: string): Promise<AssetLoanTypeOrmEntity[]> {
    const qb = this.loanRepo
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.requestingPerson', 'person')
      .leftJoinAndSelect('loan.items', 'items')
      .leftJoinAndSelect('items.asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.brand', 'brand')
      .leftJoinAndSelect('asset.model', 'model')
      .orderBy('loan.createdAt', 'DESC');

    if (status) {
      qb.andWhere('loan.status = :status', { status });
    }

    return qb.getMany();
  }

  async getAll(): Promise<AssetLoanTypeOrmEntity[]> {
    return this.listLoans();
  }

  async getLoanById(id: string): Promise<AssetLoanTypeOrmEntity> {
    const loan = await this.loanRepo.findOne({
      where: { id },
      relations: [
        'requestingPerson',
        'items',
        'items.asset',
        'items.asset.category',
        'items.asset.brand',
        'items.asset.model',
      ],
    });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    return loan;
  }

  async getById(id: string): Promise<AssetLoanTypeOrmEntity> {
    return this.getLoanById(id);
  }

  // RF-19: Alertas en dashboard indicando préstamos pendientes y por retraso en devolución
  async getDelayedLoans(): Promise<AssetLoanTypeOrmEntity[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.loanRepo
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.requestingPerson', 'person')
      .leftJoinAndSelect('loan.items', 'items')
      .leftJoinAndSelect('items.asset', 'asset')
      .where('loan.status = :status', { status: 'ENTREGADO' })
      .andWhere('loan.expectedReturnDate < :today', { today })
      .orderBy('loan.expectedReturnDate', 'ASC')
      .getMany();
  }

  // RF-17: Catálogo de Activos para Préstamo
  async getLoanableAssets(): Promise<AssetTypeOrmEntity[]> {
    return this.assetRepo.find({
      where: { isLoanable: true, isActive: true },
      relations: ['category', 'brand', 'model'],
    });
  }

  async createLoan(dto: CreateAssetLoanDto): Promise<AssetLoanTypeOrmEntity> {
    const year = new Date().getFullYear();
    const count = await this.loanRepo.count();
    const nextSeq = String(count + 1).padStart(4, '0');
    const loanCode = `PREST-${year}-${nextSeq}`;

    // Verify all assets are available
    for (const assetId of dto.assetIds) {
      const asset = await this.assetRepo.findOne({ where: { id: assetId } });
      if (!asset) throw new NotFoundException(`Activo con ID ${assetId} no existe`);
      if (asset.status === 'EN_PRESTAMO') {
        throw new BadRequestException(`El activo ${asset.computerCode} ya se encuentra prestado.`);
      }
    }

    const loan = this.loanRepo.create({
      loanCode,
      loanNumber: loanCode,
      requestingOffice: dto.requestingOffice,
      requestingPersonId: dto.requestingPersonId || null,
      borrowerName: dto.borrowerName,
      startDate: dto.startDate,
      expectedReturnDate: dto.expectedReturnDate,
      eventReason: dto.eventReason,
      status: 'ENTREGADO',
      technicianName: dto.technicianName || 'Técnico Informático ODT',
      notes: dto.notes || null,
    });

    const savedLoan = await this.loanRepo.save(loan);

    // Save items and update asset status to EN_PRESTAMO
    for (const assetId of dto.assetIds) {
      const item = this.loanItemRepo.create({
        loanId: savedLoan.id,
        assetId,
      });
      await this.loanItemRepo.save(item);

      const asset = await this.assetRepo.findOne({ where: { id: assetId } });
      if (asset) {
        asset.status = 'EN_PRESTAMO';
        await this.assetRepo.save(asset);
      }
    }

    return this.getLoanById(savedLoan.id);
  }

  async create(dto: CreateAssetLoanDto): Promise<AssetLoanTypeOrmEntity> {
    return this.createLoan(dto);
  }

  // RF-20: Actas de Salida y Retorno (Validación de estado operativo al retorno)
  async returnLoan(id: string, dto: ReturnAssetLoanDto): Promise<AssetLoanTypeOrmEntity> {
    const loan = await this.getLoanById(id);
    loan.status = 'DEVUELTO';
    loan.actualReturnDate = new Date().toISOString();
    loan.returnCondition = dto.returnCondition;
    if (dto.notes) loan.notes = (loan.notes ? loan.notes + '\n' : '') + dto.notes;

    // Reset status of assets back to OPERATIVO or EN_MANTENIMIENTO depending on return condition
    if (loan.items && loan.items.length > 0) {
      for (const item of loan.items) {
        const asset = await this.assetRepo.findOne({ where: { id: item.assetId } });
        if (asset) {
          asset.status = dto.returnCondition === 'DAÑADO' ? 'EN_MANTENIMIENTO' : 'OPERATIVO';
          await this.assetRepo.save(asset);
        }
      }
    }

    await this.loanRepo.save(loan);
    return this.getLoanById(loan.id);
  }
}
