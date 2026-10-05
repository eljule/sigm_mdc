import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryAuditTypeOrmEntity } from '../../infrastructure/persistence/entities/inventory-audit.typeorm.entity';
import { AuditVerificationTypeOrmEntity } from '../../infrastructure/persistence/entities/audit-verification.typeorm.entity';
import { AssetTypeOrmEntity } from '../../infrastructure/persistence/entities/asset.typeorm.entity';
import { CreateInventoryAuditDto, VerifyAssetAuditDto } from '../dtos/itam-extended.dto';

@Injectable()
export class ManageAuditsUseCase {
  constructor(
    @InjectRepository(InventoryAuditTypeOrmEntity)
    private readonly auditRepo: Repository<InventoryAuditTypeOrmEntity>,
    @InjectRepository(AuditVerificationTypeOrmEntity)
    private readonly verificationRepo: Repository<AuditVerificationTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async listAudits(): Promise<InventoryAuditTypeOrmEntity[]> {
    return this.auditRepo.find({
      order: { year: 'DESC', createdAt: 'DESC' },
      relations: ['verifications'],
    });
  }

  async getAuditById(id: string): Promise<InventoryAuditTypeOrmEntity> {
    const found = await this.auditRepo.findOne({
      where: { id },
      relations: ['verifications', 'verifications.asset', 'verifications.asset.category', 'verifications.asset.brand', 'verifications.asset.model'],
    });
    if (!found) {
      throw new NotFoundException(`Auditoría de inventario con ID ${id} no encontrada`);
    }
    return found;
  }

  /**
   * RF-11: Cierres y Aperturas de Inventario Anual
   * Generación de una fotografía (snapshot) del inventario por año fiscal.
   */
  async createAudit(dto: CreateInventoryAuditDto): Promise<InventoryAuditTypeOrmEntity> {
    // Verificar si ya existe auditoría abierta para ese año
    const existing = await this.auditRepo.findOne({
      where: { year: dto.year, status: 'EN_PROCESO' },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe una auditoría de inventario en proceso para el año fiscal ${dto.year}`,
      );
    }

    // Tomar snapshot de todos los activos no dados de baja
    const allAssets = await this.assetRepo.find({
      relations: ['category', 'brand', 'model', 'assignedPerson'],
    });

    const snapshotAssets = allAssets.map((a) => ({
      id: a.id,
      computerCode: a.computerCode,
      patrimonialCode: a.patrimonialCode,
      serialNumber: a.serialNumber,
      categoryName: a.category?.name || 'N/A',
      brandName: a.brand?.name || 'N/A',
      modelName: a.model?.name || 'N/A',
      office: a.office || 'Sin Oficina',
      assignedPersonName: a.assignedPerson
        ? `${a.assignedPerson.firstName} ${a.assignedPerson.paternalSurname}`.trim()
        : 'Sin Asignar',
      status: a.status,
    }));

    const snapshotData = {
      capturedAt: new Date().toISOString(),
      totalAssetsCount: snapshotAssets.length,
      assets: snapshotAssets,
    };

    const audit = this.auditRepo.create({
      year: dto.year,
      title: dto.title,
      status: 'EN_PROCESO',
      startDate: new Date().toISOString().split('T')[0],
      snapshotData,
      notes: dto.notes || null,
    });

    const saved = await this.auditRepo.save(audit);

    // Precargar las verificaciones pendientes en base al snapshot
    const initialVerifications = allAssets.map((asset) => {
      return this.verificationRepo.create({
        auditId: saved.id,
        assetId: asset.id,
        expectedOffice: asset.office || null,
        foundOffice: null,
        status: 'PENDIENTE',
        verifiedBy: null,
        notes: null,
      });
    });

    if (initialVerifications.length > 0) {
      await this.verificationRepo.save(initialVerifications);
    }

    return this.getAuditById(saved.id);
  }

  /**
   * RF-12: Conciliación de Inventario (Verificación física en campo / tablet / pistola lectora)
   */
  async verifyAsset(dto: VerifyAssetAuditDto): Promise<AuditVerificationTypeOrmEntity> {
    const audit = await this.auditRepo.findOne({ where: { id: dto.auditId } });
    if (!audit) throw new NotFoundException('Auditoría no encontrada');
    if (audit.status === 'CERRADO') {
      throw new BadRequestException('La auditoría de inventario ya se encuentra cerrada y no admite más conciliaciones');
    }

    const asset = await this.assetRepo.findOne({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Activo tecnológico no encontrado');

    let verification = await this.verificationRepo.findOne({
      where: { auditId: dto.auditId, assetId: dto.assetId },
    });

    const isRelocated = asset.office && dto.foundOffice && asset.office.trim().toLowerCase() !== dto.foundOffice.trim().toLowerCase();
    const finalStatus = dto.status || (isRelocated ? 'TRASLADADO_NO_AUTORIZADO' : 'CONCILIADO');

    if (!verification) {
      verification = this.verificationRepo.create({
        auditId: dto.auditId,
        assetId: dto.assetId,
        expectedOffice: asset.office,
        foundOffice: dto.foundOffice,
        status: finalStatus,
        verifiedBy: dto.verifiedBy || 'Técnico de Inventario TI',
        notes: dto.notes || null,
      });
    } else {
      verification.expectedOffice = asset.office;
      verification.foundOffice = dto.foundOffice;
      verification.status = finalStatus;
      verification.verifiedBy = dto.verifiedBy || 'Técnico de Inventario TI';
      verification.notes = dto.notes || null;
    }

    return this.verificationRepo.save(verification);
  }

  async closeAudit(id: string, notes?: string): Promise<InventoryAuditTypeOrmEntity> {
    const audit = await this.getAuditById(id);
    if (audit.status === 'CERRADO') {
      throw new BadRequestException('La auditoría ya se encuentra cerrada');
    }

    audit.status = 'CERRADO';
    audit.closeDate = new Date().toISOString().split('T')[0];
    if (notes) {
      audit.notes = (audit.notes ? `${audit.notes}\n` : '') + `[Cierre]: ${notes}`;
    }

    return this.auditRepo.save(audit);
  }

  /**
   * Reporte consolidado de conciliación física vs. código patrimonial (RF-12)
   */
  async getConciliationReport(auditId: string) {
    const audit = await this.getAuditById(auditId);
    const verifications = audit.verifications || [];

    const total = verifications.length;
    const conciliados = verifications.filter((v) => v.status === 'CONCILIADO').length;
    const trasladosNoAutorizados = verifications.filter((v) => v.status === 'TRASLADADO_NO_AUTORIZADO').length;
    const noHabidos = verifications.filter((v) => v.status === 'NO_HABIDO' || v.status === 'FALTANTE').length;
    const pendientes = verifications.filter((v) => v.status === 'PENDIENTE').length;

    const progressPercentage = total > 0 ? Math.round(((total - pendientes) / total) * 100) : 0;

    return {
      audit: {
        id: audit.id,
        year: audit.year,
        title: audit.title,
        status: audit.status,
        startDate: audit.startDate,
        closeDate: audit.closeDate,
      },
      summary: {
        total,
        conciliados,
        trasladosNoAutorizados,
        noHabidos,
        pendientes,
        progressPercentage,
      },
      verifications,
    };
  }
}
