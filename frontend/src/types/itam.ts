export type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'tags' | 'list';

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  unit?: string;
  defaultValue?: any;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon: string;
  color: string;
  customFieldsSchema: CustomFieldDefinition[];
  isActive: boolean;
}

export interface AssetBrand {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AssetModel {
  id: string;
  name: string;
  brandId: string;
  brandName?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  isActive: boolean;
}

export type AssetStatus =
  | 'OPERATIVO'
  | 'EN_MANTENIMIENTO'
  | 'EN_DESUSO'
  | 'PARA_BAJA'
  | 'EN_CUSTODIA'
  | 'EN_PRESTAMO';

export type AssetPhysicalCondition = 'NUEVO' | 'BUENO' | 'REGULAR' | 'MALO';

export interface AssetChildSummary {
  id: string;
  computerCode: string;
  patrimonialCode?: string | null;
  serialNumber?: string | null;
  categoryName?: string;
  brandName?: string;
  modelName?: string;
  status: string;
}

export interface Asset {
  id: string;
  computerCode: string;
  patrimonialCode?: string | null;
  serialNumber?: string | null;
  categoryId: string;
  categoryName?: string;
  categoryCode?: string;
  brandId: string;
  brandName?: string;
  modelId: string;
  modelName?: string;
  parentAssetId?: string | null;
  parentAssetComputerCode?: string | null;
  childAssets?: AssetChildSummary[];
  supplier?: string | null;
  warrantyEndDate?: string | null;
  isLoanable?: boolean;
  color?: string | null;
  status: AssetStatus;
  physicalCondition: AssetPhysicalCondition;
  office?: string | null;
  assignedPersonId?: string | null;
  assignedPersonName?: string | null;
  acquisitionDate?: string | null;
  specifications: Record<string, any>;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetStatistics {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface CreateAssetPayload {
  categoryId: string;
  brandId: string;
  modelId: string;
  patrimonialCode?: string;
  serialNumber?: string;
  parentAssetId?: string;
  supplier?: string;
  warrantyEndDate?: string;
  isLoanable?: boolean;
  color?: string;
  status?: AssetStatus;
  physicalCondition?: AssetPhysicalCondition;
  office?: string;
  assignedPersonId?: string;
  acquisitionDate?: string;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface UpdateAssetPayload {
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  parentAssetId?: string;
  supplier?: string;
  warrantyEndDate?: string;
  isLoanable?: boolean;
  patrimonialCode?: string;
  serialNumber?: string;
  color?: string;
  status?: AssetStatus;
  physicalCondition?: AssetPhysicalCondition;
  office?: string;
  assignedPersonId?: string;
  acquisitionDate?: string;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface CreateCategoryPayload {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  customFieldsSchema?: CustomFieldDefinition[];
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  customFieldsSchema?: CustomFieldDefinition[];
  isActive?: boolean;
}

// -----------------------------------------------------------------------------
// SOFTWARE INSTITUCIONAL (RF-02 & RF-06)
// -----------------------------------------------------------------------------
export interface Software {
  id: string;
  name: string;
  version?: string | null;
  developer?: string | null;
  licenseType?: string | null; // OEM, RETAIL, VOLUMEN, OPEN_SOURCE, SUSCRIPCION
  licenseKey?: string | null;
  totalLicenses: number;
  expirationDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetSoftware {
  id: string;
  assetId: string;
  softwareId: string;
  software?: Software;
  licenseKeyUsed?: string | null;
  installedAt: string;
}

// -----------------------------------------------------------------------------
// MOVIMIENTOS, TRASLADOS Y ACTAS (RF-07, RF-08, RF-09, RF-10)
// -----------------------------------------------------------------------------
export interface AssetMovement {
  id: string;
  assetId: string;
  asset?: Asset;
  actaNumber: string; // MDC-ACTA-MOV-2026-0001
  fromOffice?: string | null;
  toOffice: string;
  movementType: 'TRASLADO' | 'ASIGNACION_INICIAL' | 'RETORNO' | 'REASIGNACION';
  movementDate: string;
  reason: string;
  technicianName: string;
  newCustodianName?: string | null;
  previousCustodianName?: string | null;
  includeChildrenInTransfer: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CreateMovementPayload {
  assetId: string;
  toOffice: string;
  newCustodianPersonId?: string;
  movementType?: string;
  reason: string;
  technicianName: string;
  includeChildrenInTransfer?: boolean;
  notes?: string;
}

// -----------------------------------------------------------------------------
// INSUMOS Y CONSUMIBLES (RF-14, RF-15)
// -----------------------------------------------------------------------------
export interface Supply {
  id: string;
  code?: string;
  name: string;
  category: string; // TONER, CABLEADO, CONECTORES, PASTA_TERMICA, HERRAMIENTAS, OTROS
  unit: string; // UNIDAD, METROS, CAJA, TUBO
  stock: number;
  minStock: number; // Umbral de alerta (default 2)
  isCritical?: boolean; // Calculado si stock <= minStock
  unitCost?: number;
  location?: string | null;
  compatibleModels?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------------
// MANTENIMIENTOS PREVENTIVO / CORRECTIVO (RF-13, RF-15, RF-16)
// -----------------------------------------------------------------------------
export interface MaintenanceSupplyUsed {
  id: string;
  maintenanceOrderId: string;
  supplyId: string;
  supply?: Supply;
  quantityUsed: number;
  unitCost?: number | null;
}

export interface MaintenanceOrder {
  id: string;
  orderNumber: string; // OT-MNT-2026-0001
  assetId: string;
  asset?: Asset;
  maintenanceType: 'PREVENTIVO' | 'CORRECTIVO';
  status: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'FINALIZADO' | 'CANCELADO';
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  scheduledDate: string;
  completedDate?: string | null;
  failureReported?: string | null;
  diagnosis?: string | null;
  actionsTaken?: string | null;
  technicianName?: string | null;
  totalCost?: number | null;
  notes?: string | null;
  suppliesUsed?: MaintenanceSupplyUsed[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceOrderPayload {
  assetId: string;
  maintenanceType: 'PREVENTIVO' | 'CORRECTIVO';
  scheduledDate: string;
  priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  technicianName?: string;
  failureReported?: string;
  diagnosis?: string;
  notes?: string;
}

export interface CompleteMaintenancePayload {
  diagnosis?: string;
  actionsTaken: string;
  technicianName?: string;
  completedDate?: string;
  supplies?: { supplyId: string; quantity: number }[];
  totalCost?: number;
  notes?: string;
}

// -----------------------------------------------------------------------------
// PRÉSTAMOS Y RESERVAS TEMPORALES (RF-17, RF-18, RF-19, RF-20)
// -----------------------------------------------------------------------------
export interface AssetLoanItem {
  id: string;
  loanId: string;
  assetId: string;
  asset?: Asset;
  returnedCondition?: string | null;
}

export interface AssetLoan {
  id: string;
  loanNumber: string; // PREST-2026-0001
  department: string;
  requestingPerson: string;
  reason: string;
  startDate: string;
  estimatedEndDate: string;
  actualReturnDate?: string | null;
  status: 'ACTIVO' | 'RETORNADO' | 'DEVUELTO' | 'RESERVADO' | 'ENTREGADO' | 'VENCIDO' | 'CON_RETRASO';
  returnCondition?: string | null;
  notes?: string | null;
  items?: AssetLoanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanPayload {
  assetIds: string[];
  department: string;
  requestingPerson: string;
  reason: string;
  startDate: string;
  estimatedEndDate: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// AUDITORÍA ANUAL Y CONCILIACIÓN FÍSICA (RF-11, RF-12)
// -----------------------------------------------------------------------------
export interface AuditVerification {
  id: string;
  auditId: string;
  assetId: string;
  asset?: Asset;
  expectedOffice?: string | null;
  foundOffice?: string | null;
  status: 'PENDIENTE' | 'CONCILIADO' | 'TRASLADADO_NO_AUTORIZADO' | 'NO_HABIDO' | 'FALTANTE';
  verifiedBy?: string | null;
  notes?: string | null;
  verifiedAt: string;
}

export interface InventoryAudit {
  id: string;
  year: number;
  title: string;
  status: 'EN_PROCESO' | 'CERRADO';
  startDate: string;
  closeDate?: string | null;
  snapshotData?: Record<string, any>;
  totalAssetsSnapshot?: number;
  notes?: string | null;
  verifications?: AuditVerification[];
  createdAt: string;
  updatedAt: string;
}

export interface ConciliationReport {
  audit: {
    id: string;
    year: number;
    title: string;
    status: string;
    startDate: string;
    closeDate?: string | null;
  };
  summary: {
    total: number;
    conciliados: number;
    trasladosNoAutorizados: number;
    noHabidos: number;
    pendientes: number;
    progressPercentage: number;
  };
  verifications: AuditVerification[];
}
