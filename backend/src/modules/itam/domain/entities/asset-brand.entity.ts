export interface AssetBrandProps {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export class AssetBrand {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _isActive: boolean;

  constructor(props: AssetBrandProps) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description || '';
    this._isActive = props.isActive !== false;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  update(name?: string, description?: string, isActive?: boolean): void {
    if (name !== undefined) this._name = name.trim();
    if (description !== undefined) this._description = description.trim();
    if (isActive !== undefined) this._isActive = isActive;
  }

  toObject(): AssetBrandProps {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      isActive: this._isActive,
    };
  }
}
