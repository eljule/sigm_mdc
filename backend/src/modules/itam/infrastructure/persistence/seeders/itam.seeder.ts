import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategoryTypeOrmEntity } from '../entities/asset-category.typeorm.entity';
import { AssetBrandTypeOrmEntity } from '../entities/asset-brand.typeorm.entity';
import { AssetModelTypeOrmEntity } from '../entities/asset-model.typeorm.entity';
import { AssetTypeOrmEntity } from '../entities/asset.typeorm.entity';
import { PersonEntity } from '../../../../../core/people/infrastructure/persistence/entities/person.entity';

@Injectable()
export class ItamSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ItamSeederService.name);

  constructor(
    @InjectRepository(AssetCategoryTypeOrmEntity)
    private readonly categoryRepo: Repository<AssetCategoryTypeOrmEntity>,
    @InjectRepository(AssetBrandTypeOrmEntity)
    private readonly brandRepo: Repository<AssetBrandTypeOrmEntity>,
    @InjectRepository(AssetModelTypeOrmEntity)
    private readonly modelRepo: Repository<AssetModelTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
    @InjectRepository(PersonEntity)
    private readonly personRepo: Repository<PersonEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCategories();
    await this.seedBrandsAndModels();
    // seedInitialAssets deshabilitado para permitir ingreso de datos reales
  }

  private async seedCategories() {
    const count = await this.categoryRepo.count();
    if (count > 0) {
      this.logger.log(`Tabla itam_asset_categories ya contiene ${count} categorías. Omitiendo seed.`);
      return;
    }

    this.logger.log('Inicializando categorías de activos tecnológicos y esquemas dinámicos...');

    const categories = [
      {
        name: 'PC de Escritorio',
        code: 'PC',
        icon: '🖥️',
        color: '#2563eb',
        description: 'Computadoras de escritorio tradicionales con case, CPU independiente y componentes modulares.',
        customFieldsSchema: [
          {
            key: 'processor',
            label: 'Procesador (CPU)',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. Intel Core i7-12700 / AMD Ryzen 7 5700G',
          },
          {
            key: 'ram_gb',
            label: 'Memoria RAM',
            type: 'select' as const,
            required: true,
            options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'],
          },
          {
            key: 'storage_primary',
            label: 'Disco Principal (SO)',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. 512 GB SSD NVMe M.2',
          },
          {
            key: 'storage_secondary',
            label: 'Disco Secundario (Datos)',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 1 TB HDD SATA 7200RPM',
          },
          {
            key: 'gpu',
            label: 'Tarjeta de Video',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. Integrada Intel UHD 770 / NVIDIA GTX 1650 4GB',
          },
          {
            key: 'os',
            label: 'Sistema Operativo',
            type: 'select' as const,
            required: true,
            options: [
              'Windows 11 Pro 64-bit',
              'Windows 10 Pro 64-bit',
              'Ubuntu Linux 24.04 LTS',
              'Otro',
            ],
          },
        ],
      },
      {
        name: 'Laptop o Equipo Portátil',
        code: 'LAP',
        icon: '💻',
        color: '#0891b2',
        description: 'Equipos portátiles para trabajo remoto, funcionarios y movilidad institucional.',
        customFieldsSchema: [
          {
            key: 'processor',
            label: 'Procesador (CPU)',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. Intel Core i5-1135G7 2.4GHz',
          },
          {
            key: 'ram_gb',
            label: 'Memoria RAM',
            type: 'select' as const,
            required: true,
            options: ['8 GB', '16 GB', '32 GB'],
          },
          {
            key: 'storage',
            label: 'Almacenamiento SSD',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. 512 GB SSD M.2 PCIe',
          },
          {
            key: 'screen_size',
            label: 'Tamaño de Pantalla',
            type: 'select' as const,
            required: true,
            options: ['13.3 Pulgadas', '14.0 Pulgadas', '15.6 Pulgadas', '16.0 Pulgadas'],
          },
          {
            key: 'has_charger',
            label: '¿Incluye Cargador Original?',
            type: 'boolean' as const,
            required: false,
            defaultValue: true,
          },
          {
            key: 'os',
            label: 'Sistema Operativo',
            type: 'select' as const,
            required: true,
            options: ['Windows 11 Pro 64-bit', 'Windows 10 Pro 64-bit', 'Ubuntu Linux', 'macOS'],
          },
        ],
      },
      {
        name: 'Monitor de Video',
        code: 'MON',
        icon: '📺',
        color: '#16a34a',
        description: 'Pantallas externas de visualización para puestos de trabajo de oficina.',
        customFieldsSchema: [
          {
            key: 'screen_size_inches',
            label: 'Tamaño de Pantalla (Pulgadas)',
            type: 'number' as const,
            required: true,
            placeholder: 'Ej. 24',
          },
          {
            key: 'resolution',
            label: 'Resolución Nativa',
            type: 'select' as const,
            required: true,
            options: ['1366x768 (HD)', '1920x1080 (FHD)', '2560x1440 (2K)', '3840x2160 (4K)'],
          },
          {
            key: 'panel_type',
            label: 'Tipo de Panel',
            type: 'select' as const,
            required: false,
            options: ['IPS', 'VA', 'TN', 'OLED'],
          },
          {
            key: 'video_ports',
            label: 'Puertos de Entrada de Video',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. HDMI, DisplayPort, VGA',
          },
        ],
      },
      {
        name: 'Mouse y Periféricos',
        code: 'PER',
        icon: '🖱️',
        color: '#d97706',
        description: 'Dispositivos de entrada, ratones ópticos, teclados y lectores periféricos.',
        customFieldsSchema: [
          {
            key: 'connector_type',
            label: 'Tipo de Conexión',
            type: 'select' as const,
            required: true,
            options: [
              'USB Cableado',
              'Inalámbrico 2.4GHz Dongle',
              'Bluetooth',
              'Dual (2.4GHz + BT)',
            ],
          },
          {
            key: 'sensor_type',
            label: 'Tecnología de Sensor',
            type: 'select' as const,
            required: false,
            options: ['Óptico LED', 'Láser'],
          },
          {
            key: 'dpi',
            label: 'Resolución / Sensibilidad DPI',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 1000 DPI / 1600 DPI',
          },
        ],
      },
      {
        name: 'Impresora y Multifuncional',
        code: 'PRN',
        icon: '🖨️',
        color: '#9333ea',
        description: 'Impresoras departamentales, escáneres y equipos de emisión documental.',
        customFieldsSchema: [
          {
            key: 'print_type',
            label: 'Tecnología de Impresión',
            type: 'select' as const,
            required: true,
            options: [
              'Sistema Continuo de Tinta (EcoTank)',
              'Láser Monocromático (B/N)',
              'Láser a Color',
              'Matricial de Impacto',
              'Térmica para Tickets',
            ],
          },
          {
            key: 'connectivity',
            label: 'Interfaces de Conectividad',
            type: 'select' as const,
            required: true,
            options: [
              'Red Ethernet RJ45 + USB',
              'Wi-Fi + USB',
              'Solo Cable USB',
              'Ethernet + Wi-Fi + USB',
            ],
          },
          {
            key: 'network_ip',
            label: 'Dirección IP de Red Estática',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 192.168.1.150',
          },
        ],
      },
    ];

    for (const cat of categories) {
      await this.categoryRepo.save(this.categoryRepo.create(cat));
    }

    this.logger.log('Categorías de ITAM sembradas exitosamente.');
  }

  private async seedBrandsAndModels() {
    const brandCount = await this.brandRepo.count();
    if (brandCount > 0) return;

    this.logger.log('Inicializando marcas y modelos tecnológicos...');

    const brandsData = [
      {
        name: 'HP',
        description: 'Hewlett-Packard computadoras e impresoras corporativas.',
        models: [
          { name: 'ProDesk 400 G6 Microtower', code: 'PC' },
          { name: 'ProBook 450 G8', code: 'LAP' },
          { name: 'LaserJet Pro M404dw', code: 'PRN' },
        ],
      },
      {
        name: 'Lenovo',
        description: 'Equipos corporativos ThinkCentre y ThinkPad.',
        models: [
          { name: 'ThinkCentre M70s Gen 3', code: 'PC' },
          { name: 'ThinkPad E14 Gen 4', code: 'LAP' },
        ],
      },
      {
        name: 'Dell',
        description: 'Sistemas informáticos empresariales OptiPlex y Latitude.',
        models: [
          { name: 'OptiPlex 3080 SFF', code: 'PC' },
          { name: 'Latitude 3420', code: 'LAP' },
          { name: 'UltraSharp U2422H 24"', code: 'MON' },
        ],
      },
      {
        name: 'Samsung',
        description: 'Monitores y pantallas LED para puestos administrativos.',
        models: [
          { name: 'Essential Curved S36C 24"', code: 'MON' },
          { name: 'Odyssey G3 27" FHD', code: 'MON' },
        ],
      },
      {
        name: 'Epson',
        description: 'Equipos de impresión continua para dependencias de mesa de partes.',
        models: [
          { name: 'EcoTank L3250 Multifuncional', code: 'PRN' },
          { name: 'EcoTank L5590 ADF Red', code: 'PRN' },
        ],
      },
      {
        name: 'Logitech',
        description: 'Periféricos ergonómicos, ratones y teclados.',
        models: [
          { name: 'M170 Wireless Mouse', code: 'PER' },
          { name: 'B100 Optical USB', code: 'PER' },
          { name: 'MK120 Combo Teclado y Mouse', code: 'PER' },
        ],
      },
    ];

    for (const b of brandsData) {
      const savedBrand = await this.brandRepo.save(
        this.brandRepo.create({ name: b.name, description: b.description, isActive: true }),
      );

      for (const m of b.models) {
        const cat = await this.categoryRepo.findOne({ where: { code: m.code } });
        await this.modelRepo.save(
          this.modelRepo.create({
            name: m.name,
            brandId: savedBrand.id,
            categoryId: cat?.id || null,
            isActive: true,
          }),
        );
      }
    }

    this.logger.log('Marcas y modelos de ITAM sembrados exitosamente.');
  }

  private async seedInitialAssets() {
    const assetCount = await this.assetRepo.count();
    if (assetCount > 0) return;

    this.logger.log('Sembrando activos tecnológicos demostrativos...');

    const pcCat = await this.categoryRepo.findOne({ where: { code: 'PC' } });
    const lapCat = await this.categoryRepo.findOne({ where: { code: 'LAP' } });
    const monCat = await this.categoryRepo.findOne({ where: { code: 'MON' } });
    const prnCat = await this.categoryRepo.findOne({ where: { code: 'PRN' } });
    const perCat = await this.categoryRepo.findOne({ where: { code: 'PER' } });

    const hpBrand = await this.brandRepo.findOne({ where: { name: 'HP' } });
    const dellBrand = await this.brandRepo.findOne({ where: { name: 'Dell' } });
    const lenovoBrand = await this.brandRepo.findOne({ where: { name: 'Lenovo' } });
    const epsonBrand = await this.brandRepo.findOne({ where: { name: 'Epson' } });
    const logitechBrand = await this.brandRepo.findOne({ where: { name: 'Logitech' } });

    const dellPCModel = await this.modelRepo.findOne({ where: { name: 'OptiPlex 3080 SFF' } });
    const lenovoLapModel = await this.modelRepo.findOne({ where: { name: 'ThinkPad E14 Gen 4' } });
    const dellMonModel = await this.modelRepo.findOne({ where: { name: 'UltraSharp U2422H 24"' } });
    const epsonPrnModel = await this.modelRepo.findOne({ where: { name: 'EcoTank L5590 ADF Red' } });
    const logitechMouseModel = await this.modelRepo.findOne({ where: { name: 'M170 Wireless Mouse' } });

    // Buscar servidores municipales para asignar custodios
    const personalMembers = await this.personRepo.find({ where: { type: 'PERSONAL' }, take: 4 });

    const initialAssets = [
      {
        computerCode: 'MDC-TI-PC-0001',
        patrimonialCode: '740895000101',
        serialNumber: 'MXL83920Dell',
        categoryId: pcCat?.id || '',
        brandId: dellBrand?.id || '',
        modelId: dellPCModel?.id || '',
        color: 'Negro',
        status: 'OPERATIVO',
        physicalCondition: 'BUENO',
        office: 'Oficina de Desarrollo Tecnológico (ODT)',
        assignedPersonId: personalMembers[0]?.id || null,
        acquisitionDate: '2025-03-15',
        specifications: {
          processor: 'Intel Core i7-10700 2.9GHz (8 núcleos)',
          ram_gb: '16 GB',
          storage_primary: '512 GB SSD NVMe M.2 Kingston',
          storage_secondary: '1 TB HDD Seagate Barracuda',
          gpu: 'Integrada Intel UHD 630',
          os: 'Windows 11 Pro 64-bit',
        },
        notes: 'Equipo principal de desarrollo y administración de servidores ODT.',
      },
      {
        computerCode: 'MDC-TI-LAP-0001',
        patrimonialCode: '740895000102',
        serialNumber: 'PF39ABLenovo',
        categoryId: lapCat?.id || '',
        brandId: lenovoBrand?.id || '',
        modelId: lenovoLapModel?.id || '',
        color: 'Plata / Negro',
        status: 'OPERATIVO',
        physicalCondition: 'NUEVO',
        office: 'Gerencia Municipal',
        assignedPersonId: personalMembers[1]?.id || null,
        acquisitionDate: '2026-01-20',
        specifications: {
          processor: 'AMD Ryzen 7 5700U 1.8GHz Turbo',
          ram_gb: '16 GB',
          storage: '512 GB SSD PCIe Gen3',
          screen_size: '14.0 Pulgadas',
          has_charger: true,
          os: 'Windows 11 Pro 64-bit',
        },
        notes: 'Laptop asignada para comisiones oficiales y sesiones de concejo.',
      },
      {
        computerCode: 'MDC-TI-MON-0001',
        patrimonialCode: '740895000103',
        serialNumber: 'CN-0Y29Dell',
        categoryId: monCat?.id || '',
        brandId: dellBrand?.id || '',
        modelId: dellMonModel?.id || '',
        color: 'Plata / Negro',
        status: 'OPERATIVO',
        physicalCondition: 'BUENO',
        office: 'Subgerencia de Transportes y Tránsito',
        assignedPersonId: personalMembers[2]?.id || null,
        acquisitionDate: '2024-11-10',
        specifications: {
          screen_size_inches: 24,
          resolution: '1920x1080 (FHD)',
          panel_type: 'IPS',
          video_ports: 'HDMI 1.4, DisplayPort 1.4, USB-C Hub',
        },
        notes: 'Monitor de alta resolución para emisión de licencias de conducir.',
      },
      {
        computerCode: 'MDC-TI-PRN-0001',
        patrimonialCode: '740895000104',
        serialNumber: 'X89Q120Epson',
        categoryId: prnCat?.id || '',
        brandId: epsonBrand?.id || '',
        modelId: epsonPrnModel?.id || '',
        color: 'Negro',
        status: 'OPERATIVO',
        physicalCondition: 'BUENO',
        office: 'Secretaría General y Mesa de Partes',
        assignedPersonId: personalMembers[3]?.id || null,
        acquisitionDate: '2025-06-05',
        specifications: {
          print_type: 'Sistema Continuo de Tinta (EcoTank)',
          connectivity: 'Red Ethernet RJ45 + USB',
          network_ip: '192.168.1.185',
        },
        notes: 'Impresora de mesa de partes compartida en red municipal.',
      },
    ];

    for (const a of initialAssets) {
      if (a.categoryId && a.brandId && a.modelId) {
        await this.assetRepo.save(this.assetRepo.create(a));
      }
    }

    this.logger.log('Activos iniciales de ITAM sembrados exitosamente.');
  }
}
