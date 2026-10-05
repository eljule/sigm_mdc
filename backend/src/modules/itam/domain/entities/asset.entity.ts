export enum AssetStatus {
  OPERATIVO = 'OPERATIVO',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  EN_DESUSO = 'EN_DESUSO',
  PARA_BAJA = 'PARA_BAJA',
  EN_CUSTODIA = 'EN_CUSTODIA',
}

export enum AssetPhysicalCondition {
  NUEVO = 'NUEVO',
  BUENO = 'BUENO',
  REGULAR = 'REGULAR',
  MALO = 'MALO',
}

export interface AssetProps {
  id: string;
  computerCode: string; // MDC-TI-PC-0001
  patrimonialCode?: string | null; // Código patrimonial SBN
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
  childAssets?: any[];
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
  specifications: Record<string, any>; // Campos dinámicos adaptados según categoría
  notes?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Asset {
  private readonly _id: string;
  private _computerCode: string;
  private _patrimonialCode: string | null;
  private _serialNumber: string | null;
  private _categoryId: string;
  private _categoryName?: string;
  private _categoryCode?: string;
  private _brandId: string;
  private _brandName?: string;
  private _modelId: string;
  private _modelName?: string;
  private _parentAssetId: string | null;
  private _parentAssetComputerCode?: string | null;
  private _childAssets?: any[];
  private _supplier: string | null;
  private _warrantyEndDate: string | null;
  private _isLoanable: boolean;
  private _color: string | null;
  private _status: AssetStatus;
  private _physicalCondition: AssetPhysicalCondition;
  private _office: string | null;
  private _assignedPersonId: string | null;
  private _assignedPersonName?: string | null;
  private _acquisitionDate: string | null;
  private _specifications: Record<string, any>;
  private _notes: string | null;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: AssetProps) {
    this._id = props.id;
    this._computerCode = props.computerCode;
    this._patrimonialCode = props.patrimonialCode || null;
    this._serialNumber = props.serialNumber || null;
    this._categoryId = props.categoryId;
    this._categoryName = props.categoryName;
    this._categoryCode = props.categoryCode;
    this._brandId = props.brandId;
    this._brandName = props.brandName;
    this._modelId = props.modelId;
    this._modelName = props.modelName;
    this._parentAssetId = props.parentAssetId || null;
    this._parentAssetComputerCode = props.parentAssetComputerCode || null;
    this._childAssets = props.childAssets || [];
    this._supplier = props.supplier || null;
    this._warrantyEndDate = props.warrantyEndDate || null;
    this._isLoanable = props.isLoanable === true;
    this._color = props.color || null;
    this._status = props.status || AssetStatus.OPERATIVO;
    this._physicalCondition = props.physicalCondition || AssetPhysicalCondition.BUENO;
    this._office = props.office || null;
    this._assignedPersonId = props.assignedPersonId || null;
    this._assignedPersonName = props.assignedPersonName || null;
    this._acquisitionDate = props.acquisitionDate || null;
    this._specifications = props.specifications || {};
    this._notes = props.notes || null;
    this._isActive = props.isActive !== false;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get computerCode(): string {
    return this._computerCode;
  }

  get patrimonialCode(): string | null {
    return this._patrimonialCode;
  }

  get serialNumber(): string | null {
    return this._serialNumber;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get categoryName(): string | undefined {
    return this._categoryName;
  }

  get categoryCode(): string | undefined {
    return this._categoryCode;
  }

  get brandId(): string {
    return this._brandId;
  }

  get brandName(): string | undefined {
    return this._brandName;
  }

  get modelId(): string {
    return this._modelId;
  }

  get modelName(): string | undefined {
    return this._modelName;
  }

  get parentAssetId(): string | null {
    return this._parentAssetId;
  }

  get parentAssetComputerCode(): string | null | undefined {
    return this._parentAssetComputerCode;
  }

  get childAssets(): any[] | undefined {
    return this._childAssets;
  }

  get supplier(): string | null {
    return this._supplier;
  }

  get warrantyEndDate(): string | null {
    return this._warrantyEndDate;
  }

  get isLoanable(): boolean {
    return this._isLoanable;
  }

  get color(): string | null {
    return this._color;
  }

  get status(): AssetStatus {
    return this._status;
  }

  get physicalCondition(): AssetPhysicalCondition {
    return this._physicalCondition;
  }

  get office(): string | null {
    return this._office;
  }

  get assignedPersonId(): string | null {
    return this._assignedPersonId;
  }

  get assignedPersonName(): string | null | undefined {
    return this._assignedPersonName;
  }

  get acquisitionDate(): string | null {
    return this._acquisitionDate;
  }

  get specifications(): Record<string, any> {
    return this._specifications;
  }

  get notes(): string | null {
    return this._notes;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  updateDetails(data: {
    patrimonialCode?: string | null;
    serialNumber?: string | null;
    categoryId?: string;
    brandId?: string;
    modelId?: string;
    parentAssetId?: string | null;
    supplier?: string | null;
    warrantyEndDate?: string | null;
    isLoanable?: boolean;
    color?: string | null;
    status?: AssetStatus;
    physicalCondition?: AssetPhysicalCondition;
    office?: string | null;
    assignedPersonId?: string | null;
    acquisitionDate?: string | null;
    specifications?: Record<string, any>;
    notes?: string | null;
    isActive?: boolean;
  }): void {
    if (data.patrimonialCode !== undefined) this._patrimonialCode = data.patrimonialCode;
    if (data.serialNumber !== undefined) this._serialNumber = data.serialNumber;
    if (data.categoryId !== undefined) this._categoryId = data.categoryId;
    if (data.brandId !== undefined) this._brandId = data.brandId;
    if (data.modelId !== undefined) this._modelId = data.modelId;
    if (data.parentAssetId !== undefined) this._parentAssetId = data.parentAssetId;
    if (data.supplier !== undefined) this._supplier = data.supplier;
    if (data.warrantyEndDate !== undefined) this._warrantyEndDate = data.warrantyEndDate;
    if (data.isLoanable !== undefined) this._isLoanable = data.isLoanable;
    if (data.color !== undefined) this._color = data.color;
    if (data.status !== undefined) this._status = data.status;
    if (data.physicalCondition !== undefined) this._physicalCondition = data.physicalCondition;
    if (data.office !== undefined) this._office = data.office;
    if (data.assignedPersonId !== undefined) this._assignedPersonId = data.assignedPersonId;
    if (data.acquisitionDate !== undefined) this._acquisitionDate = data.acquisitionDate;
    if (data.specifications !== undefined) this._specifications = data.specifications;
    if (data.notes !== undefined) this._notes = data.notes;
    if (data.isActive !== undefined) this._isActive = data.isActive;
    this._updatedAt = new Date();
  }

  toObject(): AssetProps {
    return {
      id: this._id,
      computerCode: this._computerCode,
      patrimonialCode: this._patrimonialCode,
      serialNumber: this._serialNumber,
      categoryId: this._categoryId,
      categoryName: this._categoryName,
      categoryCode: this._categoryCode,
      brandId: this._brandId,
      brandName: this._brandName,
      modelId: this._modelId,
      modelName: this._modelName,
      parentAssetId: this._parentAssetId,
      parentAssetComputerCode: this._parentAssetComputerCode,
      childAssets: this._childAssets,
      supplier: this._supplier,
      warrantyEndDate: this._warrantyEndDate,
      isLoanable: this._isLoanable,
      color: this._color,
      status: this._status,
      physicalCondition: this._physicalCondition,
      office: this._office,
      assignedPersonId: this._assignedPersonId,
      assignedPersonName: this._assignedPersonName,
      acquisitionDate: this._acquisitionDate,
      specifications: this._specifications,
      notes: this._notes,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
