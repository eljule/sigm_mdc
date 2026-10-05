export type PersonType = 'ADMINISTRADO' | 'PERSONAL';
export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';

export interface Person {
  id: string;
  type: PersonType;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;

  // Personal
  position: string | null;
  office: string | null;
  laborCondition: string | null;
  entryDate: string | null;
  departureDate?: string | null;
  cessationReason?: string | null;
  laborStatus?: 'ACTIVO' | 'CESADO' | string | null;

  // Administrado
  businessName: string | null;
  allowsOnlineAccess: boolean;

  isActive: boolean;
}

export interface UserDetail {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  allowedModules: string[];
  personId?: string | null;
  isActive: boolean;
}

export interface RolePreset {
  role: string;
  description: string;
  allowedModules: string[];
  color: string;
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  description: string;
  subsystemCode: string;
  category: string;
  isActive: boolean;
}

export interface SubsystemPermissionGroup {
  subsystemCode: string;
  subsystemName: string;
  color: string;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  subsystemCode: string;
  isSystem: boolean;
  permissionCodes: string[];
  isActive: boolean;
}

export interface CreateRolePayload {
  name: string;
  code: string;
  description?: string;
  subsystemCode: string;
  permissionCodes?: string[];
}

export interface PersonCessationInfo {
  person: {
    id: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    type: string;
    position: string | null;
    office: string | null;
    laborCondition: string | null;
    laborStatus: string;
    isActive: boolean;
    entryDate: string | null;
  };
  userAccount: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
  } | null;
  assignedAssets: Array<{
    id: string;
    computerCode: string;
    patrimonialCode: string | null;
    categoryName: string;
    brandName: string;
    modelName: string;
    status: string;
    office: string | null;
  }>;
}

export interface CeasePersonPayload {
  departureDate: string;
  cessationReason: string;
  deactivateUser?: boolean;
  returnAssetsToWarehouse?: boolean;
  warehouseOffice?: string;
  authorizedBy?: string;
  notes?: string;
}

export interface CeasePersonResult {
  personId: string;
  fullName: string;
  laborStatus: string;
  departureDate: string;
  cessationReason: string;
  userDeactivated: boolean;
  returnedAssetsCount: number;
  actasGenerated: string[];
}
