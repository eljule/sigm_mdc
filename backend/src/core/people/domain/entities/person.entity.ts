export type PersonType = 'ADMINISTRADO' | 'PERSONAL';
export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
export type LaborStatus = 'ACTIVO' | 'CESADO';

export interface PersonProps {
  id: string;
  type: PersonType;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;

  // Atributos específicos para PERSONAL (servidores municipales)
  position?: string | null; // Cargo (ej: Especialista TI, Inspector de Tránsito)
  office?: string | null; // Oficina/Dependencia (ej: ODT, Subgerencia de Transportes)
  laborCondition?: string | null; // Modalidad (ej: CAS, Nombrado D.L. 276, D.L. 728, Locación)
  entryDate?: string | null;
  departureDate?: string | null;
  cessationReason?: string | null;
  laborStatus?: LaborStatus;

  // Atributos específicos para ADMINISTRADO (ciudadanos/vecinos de Castilla)
  businessName?: string | null; // Razón Social si es persona jurídica
  allowsOnlineAccess?: boolean; // Para futuros trámites en línea del administrado

  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio pura Person (Hexagonal Architecture).
 * Modela tanto a los ciudadanos administrados como al personal municipal.
 */
export class Person {
  private readonly _id: string;
  private _type: PersonType;
  private _documentType: DocumentType;
  private _documentNumber: string;
  private _firstName: string;
  private _paternalSurname: string;
  private _maternalSurname: string;
  private _email: string | null;
  private _phone: string | null;
  private _address: string | null;

  private _position: string | null;
  private _office: string | null;
  private _laborCondition: string | null;
  private _entryDate: string | null;
  private _departureDate: string | null;
  private _cessationReason: string | null;
  private _laborStatus: LaborStatus;

  private _businessName: string | null;
  private _allowsOnlineAccess: boolean;
  private _isActive: boolean;

  constructor(props: PersonProps) {
    this._id = props.id;
    this._type = props.type;
    this._documentType = props.documentType;
    this._documentNumber = props.documentNumber;
    this._firstName = props.firstName;
    this._paternalSurname = props.paternalSurname;
    this._maternalSurname = props.maternalSurname;
    this._email = props.email ?? null;
    this._phone = props.phone ?? null;
    this._address = props.address ?? null;

    this._position = props.position ?? null;
    this._office = props.office ?? null;
    this._laborCondition = props.laborCondition ?? null;
    this._entryDate = props.entryDate ?? null;
    this._departureDate = props.departureDate ?? null;
    this._cessationReason = props.cessationReason ?? null;
    this._laborStatus = props.laborStatus ?? 'ACTIVO';

    this._businessName = props.businessName ?? null;
    this._allowsOnlineAccess = props.allowsOnlineAccess ?? false;
    this._isActive = props.isActive;
  }

  get id(): string {
    return this._id;
  }

  get type(): PersonType {
    return this._type;
  }

  get documentType(): DocumentType {
    return this._documentType;
  }

  get documentNumber(): string {
    return this._documentNumber;
  }

  get firstName(): string {
    return this._firstName;
  }

  get paternalSurname(): string {
    return this._paternalSurname;
  }

  get maternalSurname(): string {
    return this._maternalSurname;
  }

  get fullName(): string {
    if (this._businessName && this._documentType === 'RUC') {
      return this._businessName;
    }
    return `${this._firstName} ${this._paternalSurname} ${this._maternalSurname}`.trim();
  }

  get email(): string | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get address(): string | null {
    return this._address;
  }

  get position(): string | null {
    return this._position;
  }

  get office(): string | null {
    return this._office;
  }

  get laborCondition(): string | null {
    return this._laborCondition;
  }

  get entryDate(): string | null {
    return this._entryDate;
  }

  get departureDate(): string | null {
    return this._departureDate;
  }

  get cessationReason(): string | null {
    return this._cessationReason;
  }

  get laborStatus(): LaborStatus {
    return this._laborStatus;
  }

  get businessName(): string | null {
    return this._businessName;
  }

  get allowsOnlineAccess(): boolean {
    return this._allowsOnlineAccess;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  isPersonal(): boolean {
    return this._type === 'PERSONAL';
  }

  isAdministrado(): boolean {
    return this._type === 'ADMINISTRADO';
  }

  enableOnlineAccess(): void {
    this._allowsOnlineAccess = true;
  }

  cease(departureDate: string, reason: string): void {
    this._laborStatus = 'CESADO';
    this._isActive = false;
    this._departureDate = departureDate;
    this._cessationReason = reason;
  }

  update(props: {
    type?: PersonType;
    documentType?: DocumentType;
    documentNumber?: string;
    firstName?: string;
    paternalSurname?: string;
    maternalSurname?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    position?: string | null;
    office?: string | null;
    laborCondition?: string | null;
    entryDate?: string | null;
    businessName?: string | null;
    allowsOnlineAccess?: boolean;
    isActive?: boolean;
  }): void {
    if (props.type !== undefined) this._type = props.type;
    if (props.documentType !== undefined) this._documentType = props.documentType;
    if (props.documentNumber !== undefined) this._documentNumber = props.documentNumber;
    if (props.firstName !== undefined) this._firstName = props.firstName;
    if (props.paternalSurname !== undefined) this._paternalSurname = props.paternalSurname;
    if (props.maternalSurname !== undefined) this._maternalSurname = props.maternalSurname;
    if (props.email !== undefined) this._email = props.email;
    if (props.phone !== undefined) this._phone = props.phone;
    if (props.address !== undefined) this._address = props.address;
    if (props.position !== undefined) this._position = props.position;
    if (props.office !== undefined) this._office = props.office;
    if (props.laborCondition !== undefined) this._laborCondition = props.laborCondition;
    if (props.entryDate !== undefined) this._entryDate = props.entryDate;
    if (props.businessName !== undefined) this._businessName = props.businessName;
    if (props.allowsOnlineAccess !== undefined) this._allowsOnlineAccess = props.allowsOnlineAccess;
    if (props.isActive !== undefined) this._isActive = props.isActive;
  }

  toObject(): PersonProps {
    return {
      id: this._id,
      type: this._type,
      documentType: this._documentType,
      documentNumber: this._documentNumber,
      firstName: this._firstName,
      paternalSurname: this._paternalSurname,
      maternalSurname: this._maternalSurname,
      email: this._email,
      phone: this._phone,
      address: this._address,
      position: this._position,
      office: this._office,
      laborCondition: this._laborCondition,
      entryDate: this._entryDate,
      departureDate: this._departureDate,
      cessationReason: this._cessationReason,
      laborStatus: this._laborStatus,
      businessName: this._businessName,
      allowsOnlineAccess: this._allowsOnlineAccess,
      isActive: this._isActive,
    };
  }
}
