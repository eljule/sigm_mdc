import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoftwareTypeOrmEntity } from '../../infrastructure/persistence/entities/software.typeorm.entity';
import { AssetSoftwareTypeOrmEntity } from '../../infrastructure/persistence/entities/asset-software.typeorm.entity';
import { CreateSoftwareDto, UpdateSoftwareDto, AssignSoftwareDto } from '../dtos/itam-extended.dto';

@Injectable()
export class ManageSoftwareUseCase {
  constructor(
    @InjectRepository(SoftwareTypeOrmEntity)
    private readonly softwareRepo: Repository<SoftwareTypeOrmEntity>,
    @InjectRepository(AssetSoftwareTypeOrmEntity)
    private readonly assetSoftwareRepo: Repository<AssetSoftwareTypeOrmEntity>,
  ) {}

  async listSoftware(): Promise<SoftwareTypeOrmEntity[]> {
    return this.softwareRepo.find({ order: { name: 'ASC' } });
  }

  async getAll(): Promise<SoftwareTypeOrmEntity[]> {
    return this.listSoftware();
  }

  async getSoftwareById(id: string): Promise<SoftwareTypeOrmEntity> {
    const sw = await this.softwareRepo.findOne({ where: { id } });
    if (!sw) throw new NotFoundException('Software no encontrado');
    return sw;
  }

  async getById(id: string): Promise<SoftwareTypeOrmEntity> {
    return this.getSoftwareById(id);
  }

  async createSoftware(dto: CreateSoftwareDto): Promise<SoftwareTypeOrmEntity> {
    const sw = this.softwareRepo.create({
      name: dto.name,
      version: dto.version || null,
      developer: dto.developer || null,
      licenseType: dto.licenseType || 'OEM',
      licenseKey: dto.licenseKey || null,
      totalLicenses: dto.totalLicenses || 1,
      expirationDate: dto.expirationDate || null,
      notes: dto.notes || null,
    });
    return this.softwareRepo.save(sw);
  }

  async create(dto: CreateSoftwareDto): Promise<SoftwareTypeOrmEntity> {
    return this.createSoftware(dto);
  }

  async updateSoftware(id: string, dto: UpdateSoftwareDto): Promise<SoftwareTypeOrmEntity> {
    const sw = await this.getSoftwareById(id);
    Object.assign(sw, dto);
    return this.softwareRepo.save(sw);
  }

  async update(id: string, dto: UpdateSoftwareDto): Promise<SoftwareTypeOrmEntity> {
    return this.updateSoftware(id, dto);
  }

  async deleteSoftware(id: string): Promise<boolean> {
    const result = await this.softwareRepo.delete(id);
    return (result.affected || 0) > 0;
  }

  async delete(id: string): Promise<void> {
    await this.deleteSoftware(id);
  }

  async getInstalledSoftwareByAsset(assetId: string): Promise<AssetSoftwareTypeOrmEntity[]> {
    return this.assetSoftwareRepo.find({
      where: { assetId },
      relations: ['software'],
    });
  }

  async getAssetSoftware(assetId: string): Promise<AssetSoftwareTypeOrmEntity[]> {
    return this.getInstalledSoftwareByAsset(assetId);
  }

  async assignSoftwareToAsset(assetId: string, dto: AssignSoftwareDto): Promise<AssetSoftwareTypeOrmEntity> {
    const existing = await this.assetSoftwareRepo.findOne({
      where: { assetId, softwareId: dto.softwareId },
      relations: ['software'],
    });
    if (existing) return existing;

    const record = this.assetSoftwareRepo.create({
      assetId,
      softwareId: dto.softwareId,
      licenseKeyUsed: dto.licenseKeyUsed || null,
    });
    await this.assetSoftwareRepo.save(record);
    return this.assetSoftwareRepo.findOneOrFail({
      where: { id: record.id },
      relations: ['software'],
    });
  }

  async assignToAsset(assetId: string, dto: AssignSoftwareDto): Promise<AssetSoftwareTypeOrmEntity> {
    return this.assignSoftwareToAsset(assetId, dto);
  }

  async removeSoftwareFromAsset(assetId: string, softwareId: string): Promise<boolean> {
    const result = await this.assetSoftwareRepo.delete({ assetId, softwareId });
    return (result.affected || 0) > 0;
  }

  async removeFromAsset(assetId: string, softwareId: string): Promise<void> {
    await this.removeSoftwareFromAsset(assetId, softwareId);
  }
}
