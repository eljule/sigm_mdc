export type ActionVariant = 'outline' | 'ghost' | 'solid';

export interface SecondaryAction {
  label: string;
  route: string;
  variant?: ActionVariant;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  route: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  requiresAuth: boolean;
  secondaryAction: SecondaryAction | null;
  isUnderMaintenance?: boolean;
  maintenanceMessage?: string | null;
  estimatedRecoveryTime?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
