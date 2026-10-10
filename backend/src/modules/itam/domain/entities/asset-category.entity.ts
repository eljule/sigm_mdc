export interface CustomFieldDefinition {
  key: string; // ej. 'processor', 'ram_gb', 'screen_size'
  label: string; // ej. 'Procesador (CPU)', 'Memoria RAM', 'Tamaño en Pulgadas'
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea' | 'tags' | 'list';
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: string[]; // Para tipo 'select'
  unit?: string; // ej. 'GB', 'Pulgadas', 'Watts'
}

export interface AssetCategoryProps {
  id: string;
  name: string;
  code: string; // ej. 'PC', 'LAP', 'MON', 'PER', 'PRN', 'RED'
  description?: string;
  icon?: string;
  color?: string;
  customFieldsSchema: CustomFieldDefinition[];
  isActive: boolean;
}

export class AssetCategory {
  private readonly _id: string;
  private _name: string;
  private _code: string;
  private _description: string;
  private _icon: string;
  private _color: string;
  private _customFieldsSchema: CustomFieldDefinition[];
  private _isActive: boolean;

  constructor(props: AssetCategoryProps) {
    this._id = props.id;
    this._name = props.name;
    this._code = props.code.toUpperCase();
    this._description = props.description || '';
    this._icon = props.icon || '💻';
    this._color = props.color || '#2563eb';
    this._customFieldsSchema = props.customFieldsSchema || [];
    this._isActive = props.isActive !== false;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get description(): string {
    return this._description;
  }

  get icon(): string {
    return this._icon;
  }

  get color(): string {
    return this._color;
  }

  get customFieldsSchema(): CustomFieldDefinition[] {
    return this._customFieldsSchema;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateDetails(data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    customFieldsSchema?: CustomFieldDefinition[];
    isActive?: boolean;
  }): void {
    if (data.name !== undefined) this._name = data.name.trim();
    if (data.description !== undefined) this._description = data.description.trim();
    if (data.icon !== undefined) this._icon = data.icon;
    if (data.color !== undefined) this._color = data.color;
    if (data.customFieldsSchema !== undefined) this._customFieldsSchema = data.customFieldsSchema;
    if (data.isActive !== undefined) this._isActive = data.isActive;
  }

  toObject(): AssetCategoryProps {
    return {
      id: this._id,
      name: this._name,
      code: this._code,
      description: this._description,
      icon: this._icon,
      color: this._color,
      customFieldsSchema: this._customFieldsSchema,
      isActive: this._isActive,
    };
  }
}
