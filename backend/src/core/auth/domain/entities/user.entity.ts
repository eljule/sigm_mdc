export interface UserProps {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: string;
  allowedModules: string[];
  isActive: boolean;
  personId?: string | null;
}

/**
 * Entidad de dominio pura User (Hexagonal Architecture).
 * Libre de dependencias externas (TypeORM, NestJS).
 */
export class User {
  private readonly _id: string;
  private readonly _username: string;
  private _passwordHash: string;
  private _fullName: string;
  private _email: string;
  private _role: string;
  private _allowedModules: string[];
  private _isActive: boolean;
  private _personId: string | null;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._fullName = props.fullName;
    this._email = props.email;
    this._role = props.role;
    this._allowedModules = props.allowedModules;
    this._isActive = props.isActive;
    this._personId = props.personId ?? null;
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get fullName(): string {
    return this._fullName;
  }

  get email(): string {
    return this._email;
  }

  get role(): string {
    return this._role;
  }

  get allowedModules(): string[] {
    return [...this._allowedModules];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get personId(): string | null {
    return this._personId;
  }

  linkPerson(personId: string): void {
    this._personId = personId;
  }

  updatePermissions(role: string, allowedModules: string[]): void {
    this._role = role;
    this._allowedModules = allowedModules;
  }

  hasAccessToModule(moduleCode: string): boolean {
    if (!this._isActive) return false;
    // ROOT o Administrador Central tiene acceso irrestricto
    if (this._role === 'Administrador Central' || this._username.toUpperCase() === 'ROOT') {
      return true;
    }
    return this._allowedModules.includes(moduleCode);
  }

  validatePassword(password: string): boolean {
    // Para desarrollo/demo soporta comparación directa o hash
    return this._passwordHash === password || this._passwordHash === `hash_${password}`;
  }

  toObject(): UserProps {
    return {
      id: this._id,
      username: this._username,
      passwordHash: this._passwordHash,
      fullName: this._fullName,
      email: this._email,
      role: this._role,
      allowedModules: this._allowedModules,
      isActive: this._isActive,
      personId: this._personId,
    };
  }
}
