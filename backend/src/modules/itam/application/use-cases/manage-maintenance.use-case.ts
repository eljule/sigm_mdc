import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplyTypeOrmEntity } from '../../infrastructure/persistence/entities/supply.typeorm.entity';
import { MaintenanceOrderTypeOrmEntity } from '../../infrastructure/persistence/entities/maintenance-order.typeorm.entity';
import { MaintenanceSupplyTypeOrmEntity } from '../../infrastructure/persistence/entities/maintenance-supply.typeorm.entity';
import { AssetTypeOrmEntity } from '../../infrastructure/persistence/entities/asset.typeorm.entity';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  AdjustSupplyStockDto,
  CreateMaintenanceOrderDto,
  CompleteMaintenanceOrderDto,
} from '../dtos/itam-extended.dto';

@Injectable()
export class ManageMaintenanceUseCase {
  constructor(
    @InjectRepository(SupplyTypeOrmEntity)
    private readonly supplyRepo: Repository<SupplyTypeOrmEntity>,
    @InjectRepository(MaintenanceOrderTypeOrmEntity)
    private readonly orderRepo: Repository<MaintenanceOrderTypeOrmEntity>,
    @InjectRepository(MaintenanceSupplyTypeOrmEntity)
    private readonly orderSupplyRepo: Repository<MaintenanceSupplyTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  // ---------------------------------------------------------------------------
  // SUPPLIES (INSUMOS Y CONSUMIBLES - RF-14)
  // ---------------------------------------------------------------------------
  async listSupplies(): Promise<SupplyTypeOrmEntity[]> {
    return this.supplyRepo.find({ order: { name: 'ASC' } });
  }

  async getAllSupplies(): Promise<SupplyTypeOrmEntity[]> {
    return this.listSupplies();
  }

  async getSupplyById(id: string): Promise<SupplyTypeOrmEntity> {
    const s = await this.supplyRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Insumo no encontrado');
    return s;
  }

  async getCriticalSupplies(): Promise<SupplyTypeOrmEntity[]> {
    return this.supplyRepo
      .createQueryBuilder('s')
      .where('s.stock <= s.minStock')
      .andWhere('s.isActive = true')
      .getMany();
  }

  async createSupply(dto: CreateSupplyDto): Promise<SupplyTypeOrmEntity> {
    const count = await this.supplyRepo.count();
    const nextSeq = String(count + 1).padStart(3, '0');
    const code = `INS-${dto.category ? dto.category.substring(0, 3).toUpperCase() : 'GEN'}-${nextSeq}`;

    const supply = this.supplyRepo.create({
      code,
      name: dto.name,
      category: dto.category || 'TONER_TINTA',
      stock: dto.stock,
      minStock: dto.minStock || 2,
      unit: dto.unit || 'UNIDAD',
      unitCost: dto.unitCost || 0.0,
      location: dto.location || null,
      compatibleModels: dto.compatibleModels || null,
      notes: dto.notes || null,
    });
    return this.supplyRepo.save(supply);
  }

  async updateSupply(id: string, dto: UpdateSupplyDto): Promise<SupplyTypeOrmEntity> {
    const s = await this.getSupplyById(id);
    Object.assign(s, dto);
    return this.supplyRepo.save(s);
  }

  async adjustStock(id: string, dto: AdjustSupplyStockDto): Promise<SupplyTypeOrmEntity> {
    const supply = await this.getSupplyById(id);
    const newStock = supply.stock + dto.quantityDelta;
    if (newStock < 0) {
      throw new BadRequestException(
        `El ajuste resultaría en un stock negativo (${newStock}). Stock actual: ${supply.stock}`,
      );
    }
    supply.stock = newStock;
    if (dto.reason) {
      supply.notes = (supply.notes ? `${supply.notes}\n` : '') + `[Ajuste Stock: ${dto.quantityDelta > 0 ? '+' : ''}${dto.quantityDelta}]: ${dto.reason}`;
    }
    return this.supplyRepo.save(supply);
  }

  // ---------------------------------------------------------------------------
  // MAINTENANCE ORDERS (RF-13, RF-15, RF-16)
  // ---------------------------------------------------------------------------
  async listOrders(assetId?: string, status?: string): Promise<MaintenanceOrderTypeOrmEntity[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.brand', 'brand')
      .leftJoinAndSelect('asset.model', 'model')
      .leftJoinAndSelect('order.suppliesUsed', 'suppliesUsed')
      .leftJoinAndSelect('suppliesUsed.supply', 'supply')
      .orderBy('order.createdAt', 'DESC');

    if (assetId) {
      qb.andWhere('order.assetId = :assetId', { assetId });
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    return qb.getMany();
  }

  async getAllOrders(): Promise<MaintenanceOrderTypeOrmEntity[]> {
    return this.listOrders();
  }

  async getOrderById(id: string): Promise<MaintenanceOrderTypeOrmEntity> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'asset',
        'suppliesUsed',
        'suppliesUsed.supply',
      ],
    });
    if (!order) throw new NotFoundException('Orden de mantenimiento no encontrada');
    if (!order.orderNumber) order.orderNumber = order.code;
    return order;
  }

  async createOrder(dto: CreateMaintenanceOrderDto): Promise<MaintenanceOrderTypeOrmEntity> {
    const asset = await this.assetRepo.findOne({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Activo no encontrado');

    const year = new Date().getFullYear();
    const count = await this.orderRepo.count();
    const nextSeq = String(count + 1).padStart(4, '0');
    const code = `OT-MNT-${year}-${nextSeq}`;

    const order = this.orderRepo.create({
      code,
      orderNumber: code,
      assetId: dto.assetId,
      type: dto.maintenanceType || dto.type || 'PREVENTIVO',
      priority: dto.priority || 'MEDIA',
      status: 'PROGRAMADO',
      scheduledDate: dto.scheduledDate || new Date().toISOString().split('T')[0],
      reportedFailure: dto.failureReported || dto.reportedFailure || null,
      technicianName: dto.technicianName || 'Técnico Informático ODT',
      notes: dto.notes || null,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Update asset status to EN_MANTENIMIENTO
    await this.assetRepo.update(asset.id, { status: 'EN_MANTENIMIENTO' });

    return this.getOrderById(savedOrder.id);
  }

  async completeOrder(id: string, dto: CompleteMaintenanceOrderDto): Promise<MaintenanceOrderTypeOrmEntity> {
    const order = await this.getOrderById(id);

    // RF-15: Descargo automático de insumos utilizados en la orden de trabajo
    const suppliesToDeduct = dto.suppliesUsed || dto.supplies;
    if (suppliesToDeduct && suppliesToDeduct.length > 0) {
      for (const item of suppliesToDeduct) {
        const supply = await this.supplyRepo.findOne({ where: { id: item.supplyId } });
        if (!supply) continue;

        if (supply.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para el insumo ${supply.name}. Stock actual: ${supply.stock}, requerido: ${item.quantity}`,
          );
        }

        // Decrement stock
        supply.stock -= item.quantity;
        await this.supplyRepo.save(supply);

        // Record usage
        const record = this.orderSupplyRepo.create({
          maintenanceOrderId: order.id,
          supplyId: supply.id,
          quantity: item.quantity,
          unitCost: Number(supply.unitCost || 0),
        });
        await this.orderSupplyRepo.save(record);
      }
    }

    // Set asset back to OPERATIVO
    if (order.assetId) {
      await this.assetRepo.update(order.assetId, { status: 'OPERATIVO' });
    }

    await this.orderRepo.update(order.id, {
      status: 'COMPLETADO',
      completedDate: new Date().toISOString().split('T')[0],
      diagnosis: dto.diagnosis,
      actionsTaken: dto.actionsTaken,
      technicianName: dto.technicianName || order.technicianName,
      notes: dto.notes || order.notes,
    });

    return this.getOrderById(order.id);
  }
}
