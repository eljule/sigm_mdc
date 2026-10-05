export interface PermissionProps {
  id: string;
  code: string; // ej: 'admin.users.manage', 'itam.assets.view'
  name: string; // ej: 'Gestionar Usuarios y Accesos'
  description: string;
  subsystemCode: string; // 'central_dashboard', 'transport_licenses', 'it_inventory', 'helpdesk_support'
  category: string; // 'USUARIOS', 'ACTIVOS', 'TICKETS', etc.
  isActive: boolean;
}

/**
 * Entidad de dominio pura Permission.
 */
export class Permission {
  private readonly _id: string;
  private readonly _code: string;
  private _name: string;
  private _description: string;
  private _subsystemCode: string;
  private _category: string;
  private _isActive: boolean;

  constructor(props: PermissionProps) {
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._subsystemCode = props.subsystemCode;
    this._category = props.category;
    this._isActive = props.isActive;
  }

  get id(): string {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get subsystemCode(): string {
    return this._subsystemCode;
  }

  get category(): string {
    return this._category;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  toObject(): PermissionProps {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      description: this._description,
      subsystemCode: this._subsystemCode,
      category: this._category,
      isActive: this._isActive,
    };
  }
}
