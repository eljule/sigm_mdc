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
        name: 'Computadora de Escritorio',
        code: 'PC',
        icon: '🖥️',
        color: '#0284c7',
        description: 'Computadoras de escritorio tradicionales con case, CPU independiente y estaciones de trabajo de oficina.',
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
            placeholder: 'Ej. Integrada / NVIDIA GTX 1650 4GB',
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
        name: 'Computadora Portátil',
        code: 'LAP',
        icon: '💻',
        color: '#0d9488',
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
        name: 'Monitor',
        code: 'MON',
        icon: '📺',
        color: '#16a34a',
        description: 'Monitores y pantallas externas de visualización para puestos de trabajo.',
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
        name: 'Equipo Multifuncional de Impresión',
        code: 'IMP',
        icon: '🖨️',
        color: '#9333ea',
        description: 'Equipos multifuncionales de impresión, escaneo y fotocopiado en red o USB.',
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
      {
        name: 'Teclado',
        code: 'TEC',
        icon: '⌨️',
        color: '#ea580c',
        description: 'Teclados cableados e inalámbricos para puestos de trabajo de oficina.',
        customFieldsSchema: [
          {
            key: 'connector_type',
            label: 'Tipo de Conexión',
            type: 'select' as const,
            required: true,
            options: ['USB Cableado', 'Inalámbrico 2.4GHz Dongle', 'Bluetooth'],
          },
          {
            key: 'layout',
            label: 'Distribución del Teclado',
            type: 'select' as const,
            required: false,
            options: ['Español (Latinoamérica)', 'Español (España)', 'Inglés (US)'],
          },
        ],
      },
      {
        name: 'Mouse',
        code: 'MOU',
        icon: '🖱️',
        color: '#d97706',
        description: 'Ratones ópticos y periféricos de puntero para computadoras.',
        customFieldsSchema: [
          {
            key: 'connector_type',
            label: 'Tipo de Conexión',
            type: 'select' as const,
            required: true,
            options: ['USB Cableado', 'Inalámbrico 2.4GHz Dongle', 'Bluetooth'],
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
        name: 'Teclado / Mouse',
        code: 'KBM',
        icon: '🕹️',
        color: '#ca8a04',
        description: 'Kits y combos integrados de teclado y ratón.',
        customFieldsSchema: [
          {
            key: 'connector_type',
            label: 'Tipo de Conexión',
            type: 'select' as const,
            required: true,
            options: ['USB Cableado', 'Inalámbrico 2.4GHz Dongle', 'Bluetooth'],
          },
        ],
      },
      {
        name: 'Estabilizador',
        code: 'EST',
        icon: '⚡',
        color: '#e11d48',
        description: 'Estabilizadores de voltaje y reguladores para protección de equipos eléctricos.',
        customFieldsSchema: [
          {
            key: 'capacity_va',
            label: 'Capacidad de Potencia (VA / W)',
            type: 'text' as const,
            required: true,
            placeholder: 'Ej. 1000VA / 1200VA / 500W',
          },
          {
            key: 'outlets_count',
            label: 'Número de Tomas',
            type: 'number' as const,
            required: false,
            placeholder: 'Ej. 6 u 8 tomas',
          },
          {
            key: 'voltage',
            label: 'Voltaje de Operación',
            type: 'select' as const,
            required: true,
            options: ['220V', '110V/220V Bi-voltaje'],
          },
        ],
      },
      {
        name: 'Supresor de Picos',
        code: 'SUP',
        icon: '🔌',
        color: '#dc2626',
        description: 'Regletas y dispositivos de protección contra sobretensiones y picos de voltaje.',
        customFieldsSchema: [
          {
            key: 'outlets_count',
            label: 'Número de Tomas',
            type: 'number' as const,
            required: false,
            placeholder: 'Ej. 6 tomas',
          },
          {
            key: 'cable_length',
            label: 'Longitud de Cable',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 1.5 metros / 3 metros',
          },
        ],
      },
      {
        name: 'Switch',
        code: 'SWT',
        icon: '🔀',
        color: '#4f46e5',
        description: 'Conmutadores de red Ethernet para infraestructura de conectividad local.',
        customFieldsSchema: [
          {
            key: 'ports_count',
            label: 'Número de Puertos RJ-45',
            type: 'select' as const,
            required: true,
            options: ['5 Puertos', '8 Puertos', '16 Puertos', '24 Puertos', '48 Puertos'],
          },
          {
            key: 'speed',
            label: 'Velocidad de Enlace',
            type: 'select' as const,
            required: true,
            options: ['Fast Ethernet (10/100 Mbps)', 'Gigabit Ethernet (10/100/1000 Mbps)', '10 Gigabit'],
          },
          {
            key: 'poe_support',
            label: '¿Soporta PoE?',
            type: 'boolean' as const,
            required: false,
            defaultValue: false,
          },
        ],
      },
      {
        name: 'Access Point / Router',
        code: 'APR',
        icon: '📡',
        color: '#0891b2',
        description: 'Puntos de acceso inalámbrico y enrutadores de red institucional.',
        customFieldsSchema: [
          {
            key: 'wifi_standard',
            label: 'Estándar Wi-Fi',
            type: 'select' as const,
            required: true,
            options: ['Wi-Fi 5 (802.11ac)', 'Wi-Fi 6 (802.11ax)', 'Wi-Fi 4 (802.11n)'],
          },
          {
            key: 'frequency_bands',
            label: 'Bandas de Frecuencia',
            type: 'select' as const,
            required: true,
            options: ['Doble Banda (2.4GHz + 5GHz)', 'Solo 2.4GHz'],
          },
          {
            key: 'ip_address',
            label: 'Dirección IP de Gestión',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 192.168.1.1',
          },
        ],
      },
      {
        name: 'Adaptador Inalámbrico',
        code: 'WIF',
        icon: '📶',
        color: '#059669',
        description: 'Adaptadores Wi-Fi USB o PCIe para terminales sin tarjeta de red inalámbrica.',
        customFieldsSchema: [
          {
            key: 'connector_type',
            label: 'Interfaz de Conexión',
            type: 'select' as const,
            required: true,
            options: ['USB 2.0 / 3.0', 'PCIe x1'],
          },
          {
            key: 'wifi_speed',
            label: 'Velocidad Máxima Wi-Fi',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 300 Mbps / 600 Mbps',
          },
          {
            key: 'frequency',
            label: 'Frecuencia de Banda',
            type: 'select' as const,
            required: false,
            options: ['Doble Banda (2.4GHz + 5GHz)', 'Solo 2.4GHz'],
          },
        ],
      },
      {
        name: 'Módem / Router',
        code: 'MOD',
        icon: '🌐',
        color: '#2563eb',
        description: 'Módems y equipos de terminación de enlace WAN / Proveedor de Internet.',
        customFieldsSchema: [
          {
            key: 'connection_type',
            label: 'Tipo de Enlace WAN',
            type: 'select' as const,
            required: true,
            options: [
              'Fibra Óptica (GPON)',
              'Cable Coaxial (DOCSIS)',
              'Ethernet WAN',
              'Línea Telefónica (VDSL/ADSL)',
            ],
          },
          {
            key: 'mac_address',
            label: 'Dirección MAC WAN',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. AA:BB:CC:DD:EE:FF',
          },
          {
            key: 'ip_address',
            label: 'Dirección IP Gateway',
            type: 'text' as const,
            required: false,
            placeholder: 'Ej. 192.168.1.1',
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
        name: 'Advance',
        description: 'Fabricante de computadoras portátiles y equipos de cómputo.',
        models: [
          { name: 'Vision VS7097', categoryCode: 'LAP' },
        ],
      },
      {
        name: 'Brother',
        description: 'Equipos multifuncionales de impresión, escaneo y consumibles.',
        models: [
          { name: 'MFC-L6915DW', categoryCode: 'IMP' },
          { name: 'MFC-L6900DW', categoryCode: 'IMP' },
          { name: 'MFC-L8900CDW', categoryCode: 'IMP' },
          { name: 'MFC-T4500DW', categoryCode: 'IMP' },
          { name: 'DCP-L5660DN', categoryCode: 'IMP' },
          { name: 'DCP-L5650DN', categoryCode: 'IMP' },
        ],
      },
      {
        name: 'Dell',
        description: 'Sistemas informáticos empresariales, computadoras y monitores.',
        models: [
          { name: 'OptiPlex Small Form Factor 7010', categoryCode: 'PC' },
        ],
      },
      {
        name: 'Elise',
        description: 'Fabricante de estabilizadores de voltaje y soluciones de protección eléctrica.',
        models: [
          { name: 'FES-10', categoryCode: 'EST' },
          { name: 'AVR PRO 1000 VI', categoryCode: 'EST' },
          { name: 'IEDA Power Safe LCR-15', categoryCode: 'EST' },
        ],
      },
      {
        name: 'Epson',
        description: 'Impresoras EcoTank, multifuncionales y soluciones de inyección de tinta.',
        models: [
          { name: 'EcoTank L395', categoryCode: 'IMP' },
          { name: 'EcoTank L3250', categoryCode: 'IMP' },
          { name: 'WorkForce Pro WF-C5710', categoryCode: 'IMP' },
          { name: 'WorkForce Pro WF-C5810', categoryCode: 'IMP' },
        ],
      },
      {
        name: 'Forza',
        description: 'Sistemas de protección eléctrica, estabilizadores y supresores de picos.',
        models: [
          { name: 'FVR-1202USB', categoryCode: 'EST' },
          { name: 'FVR-1222USB', categoryCode: 'EST' },
          { name: 'FPS-005B', categoryCode: 'SUP' },
        ],
      },
      {
        name: 'Halion',
        description: 'Periféricos de cómputo, combos de teclado y ratón.',
        models: [
          { name: 'HS224HB', categoryCode: 'KBM' },
        ],
      },
      {
        name: 'HP',
        description: 'Hewlett-Packard, computadoras de escritorio, portátiles, monitores e impresoras.',
        models: [
          { name: 'Compaq Pro 6300', categoryCode: 'PC' },
          { name: 'HP ProDesk', categoryCode: 'PC' },
          { name: 'HP 450', categoryCode: 'LAP' },
          { name: 'ProBook 4320s', categoryCode: 'LAP' },
          { name: 'E24 G4', categoryCode: 'MON' },
          { name: 'E24-G5', categoryCode: 'MON' },
          { name: 'E24mv G4', categoryCode: 'MON' },
          { name: 'LaserJet Pro MFP M1132', categoryCode: 'IMP' },
          { name: 'LaserJet P1102w', categoryCode: 'IMP' },
          { name: 'LaserJet M1212nf', categoryCode: 'IMP' },
          { name: 'LaserJet Enterprise 600', categoryCode: 'IMP' },
          { name: 'LaserJet Pro MFP M428fdw', categoryCode: 'IMP' },
          { name: 'LaserJet P3015', categoryCode: 'IMP' },
          { name: 'LaserJet M1536dnf MFP', categoryCode: 'IMP' },
        ],
      },
      {
        name: 'Lenovo',
        description: 'Equipos corporativos ThinkCentre, portátiles ThinkPad y monitores ThinkVision.',
        models: [
          { name: 'ThinkCentre M720s', categoryCode: 'PC' },
          { name: 'ThinkCentre M710s', categoryCode: 'PC' },
          { name: 'ThinkCentre M70s', categoryCode: 'PC' },
          { name: 'ThinkCentre M900', categoryCode: 'PC' },
          { name: 'D19-10', categoryCode: 'MON' },
          { name: 'ThinkVision T2224DA', categoryCode: 'MON' },
          { name: 'SM-8823 (MOJU-U00)', categoryCode: 'MOU' },
        ],
      },
      {
        name: 'LG',
        description: 'Monitores de visualización y pantallas LED de oficina.',
        models: [
          { name: 'E1941ST', categoryCode: 'MON' },
          { name: 'E2051S', categoryCode: 'MON' },
        ],
      },
      {
        name: 'Logitech',
        description: 'Periféricos ergonómicos, teclados y ratones de oficina.',
        models: [
          { name: 'K120', categoryCode: 'TEC' },
          { name: 'B100 (M-U0026)', categoryCode: 'MOU' },
        ],
      },
      {
        name: 'Sagemcom',
        description: 'Equipos de telecomunicaciones, módems y enrutadores de red.',
        models: [
          { name: 'FAST 3890V3', categoryCode: 'MOD' },
        ],
      },
      {
        name: 'Samsung',
        description: 'Monitores de visualización y pantallas LED profesionales.',
        models: [
          { name: '732NW', categoryCode: 'MON' },
        ],
      },
      {
        name: 'Sharp',
        description: 'Equipos multifuncionales de oficina y soluciones de copiado de alto volumen.',
        models: [
          { name: 'MX-6070', categoryCode: 'IMP' },
        ],
      },
      {
        name: 'Toshiba',
        description: 'Sistemas de copiado e impresión multifuncional e-STUDIO.',
        models: [
          { name: 'e-STUDIO 4508A', categoryCode: 'IMP' },
        ],
      },
      {
        name: 'TP-Link',
        description: 'Equipos de conectividad de red, switches, routers y adaptadores inalámbricos.',
        models: [
          { name: 'TL-SF1008D', categoryCode: 'SWT' },
          { name: 'TL-SF1008BD', categoryCode: 'SWT' },
          { name: 'TL-SF1024', categoryCode: 'SWT' },
          { name: 'Archer C50', categoryCode: 'APR' },
          { name: 'TL-WN8200ND', categoryCode: 'WIF' },
        ],
      },
      {
        name: 'Vastec',
        description: 'Equipos de cómputo, monitores y periféricos de oficina.',
        models: [
          { name: 'VA-MF24', categoryCode: 'MON' },
          { name: 'KM105K', categoryCode: 'TEC' },
          { name: 'KM105M', categoryCode: 'MOU' },
        ],
      },
      {
        name: 'GENÉRICO / POR DETERMINAR',
        description: 'Equipos ensamblados, clones, compatibles o sin rotulado/marca visible a simple vista.',
        models: [
          { name: 'POR VERIFICAR (DIAGNÓSTICO PENDIENTE)', categoryCode: 'PC' },
          { name: 'COMPATIBLE / ENSAMBLADO', categoryCode: 'PC' },
        ],
      },
    ];

    for (const b of brandsData) {
      const savedBrand = await this.brandRepo.save(
        this.brandRepo.create({ name: b.name, description: b.description, isActive: true }),
      );

      for (const m of b.models) {
        const cat = await this.categoryRepo.findOne({ where: { code: m.categoryCode } });
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
}
