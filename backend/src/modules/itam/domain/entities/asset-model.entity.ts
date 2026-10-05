export interface AssetModelProps {
  id: string;
  name: string;
  brandId: string;
  brandName?: string;
  categoryId?: string | null;
  categoryName?: string;
  description?: string;
  isActive: boolean;
}

export class AssetModel {
  private readonly _id: string;
  private _name: string;
  private _brandId: string;
  private _brandName?: string;
  private _categoryId?: string | null;
  private _categoryName?: string;
  private _description: string;
  private _isActive: boolean;

  constructor(props: AssetModelProps) {
    this._id = props.id;
    this._name = props.name;
    this._brandId = props.brandId;
    this._brandName = props.brandName;
    this._categoryId = props.categoryId || null;
    this._categoryName = props.categoryName;
    this._description = props.description || '';
    this._isActive = props.isActive !== false;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get brandId(): string {
    return this._brandId;
  }

  get brandName(): string | undefined {
    return this._brandName;
  }

  get categoryId(): string | null | undefined {
    return this._categoryId;
  }

  get categoryName(): string | undefined {
    return this._categoryName;
  }

  get description(): string {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  update(data: {
    name?: string;
    brandId?: string;
    categoryId?: string | null;
    description?: string;
    isActive?: boolean;
  }): void {
    if (data.name !== undefined) this._name = data.name.trim();
    if (data.brandId !== undefined) this._brandId = data.brandId;
    if (data.categoryId !== undefined) this._categoryId = data.categoryId;
    if (data.description !== undefined) this._description = data.description.trim();
    if (data.isActive !== undefined) this._isActive = data.isActive;
  }

  toObject(): AssetModelProps {
    return {
      id: this._id,
      name: this._name,
      brandId: this._brandId,
      brandName: this._brandName,
      categoryId: this._categoryId,
      categoryName: this._categoryName,
      description: this._description,
      isActive: this._isActive,
    };
  }
}
