export type TicketStatus =
  | 'ABIERTO'
  | 'EN_ATENCION'
  | 'EN_PAUSA'
  | 'EN_LABORATORIO'
  | 'RESUELTO'
  | 'CERRADO'
  | 'CANCELADO';

export type TicketPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type TicketCategory =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'RED_INTERNET'
  | 'PERMISOS'
  | 'OTROS';

export interface TicketTechnicalDetail {
  id: string;
  ticketId: string;
  confirmedCategory?: string | null;
  realDiagnosis: string | null;
  solutionApplied: string | null;
  pauseReason?: string | null;
  isDefinitiveDecommission: boolean;
  decommissionActNumber?: string | null;
  decommissionReason?: string | null;
  decommissionDestination?: string | null;
  technicianObservations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketSupply {
  id: string;
  ticketId: string;
  supplyId: string;
  supplyCode: string;
  supplyName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  notes?: string | null;
  createdAt: string;
}

export interface TicketLoan {
  id: string;
  ticketId: string;
  temporaryAssetId: string;
  temporaryAssetCode: string;
  temporaryAssetName: string;
  damagedAssetId: string;
  damagedAssetCode: string;
  damagedAssetName: string;
  deliveryDate: string;
  returnDate?: string | null;
  status: 'PRESTADO' | 'DEVUELTO';
  notes?: string | null;
  createdAt: string;
}

export interface TicketAuditLog {
  id: string;
  ticketId: string;
  previousStatus?: string | null;
  newStatus: string;
  action: string;
  performedByUserId?: string | null;
  performedByUserName: string;
  notes?: string | null;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  applicantId?: string | null;
  applicantName: string;
  applicantPhone?: string | null;
  applicantEmail?: string | null;
  officeId?: string | null;
  officeName: string;
  assetId?: string | null;
  assetComputerCode?: string | null;
  assetCategory?: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  evidencePhotoUrl?: string | null;
  status: TicketStatus;
  assignedTechnicianId?: string | null;
  assignedTechnicianName?: string | null;
  assignedTechnicianPhone?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  userConformity?: boolean | null;
  userRating?: number | null;
  userFeedback?: string | null;
  isLocked: boolean;
  lockedBy?: string | null;
  technicalDetail?: TicketTechnicalDetail | null;
  supplies: TicketSupply[];
  loans: TicketLoan[];
  auditLogs: TicketAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  applicantName: string;
  applicantPhone?: string;
  applicantEmail?: string;
  applicantId?: string;
  officeId?: string;
  officeName: string;
  assetId?: string;
  assetComputerCode?: string;
  assetCategory?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  evidencePhotoUrl?: string;
}

export interface TakeTicketPayload {
  technicianId?: string;
  technicianName: string;
  technicianPhone?: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  reason?: string;
  technicianNotes?: string;
  userName: string;
}

export interface AddTechnicalDetailPayload {
  confirmedCategory?: string;
  realDiagnosis: string;
  solutionApplied: string;
  technicianObservations?: string;
  isDefinitiveDecommission?: boolean;
  decommissionReason?: string;
  decommissionDestination?: string;
  publishToKnowledgeBase?: boolean;
  knowledgeBaseTitle?: string;
  technicianName: string;
}

export interface AddSupplyToTicketPayload {
  supplyId: string;
  quantity: number;
  notes?: string;
  technicianName: string;
}

export interface AssignProvisionalAssetPayload {
  temporaryAssetId: string;
  damagedAssetId: string;
  notes?: string;
  technicianName: string;
}

export interface ReturnProvisionalAssetPayload {
  notes?: string;
  technicianName: string;
}

export interface UserConformityPayload {
  userConformity: boolean;
  userRating?: number;
  userFeedback?: string;
  applicantName: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  symptoms?: string | null;
  solutionSteps: string;
  tags?: string[];
  sourceTicketId?: string | null;
  sourceTicketNumber?: string | null;
  authorTechnicianName: string;
  viewsCount: number;
  helpfulCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeArticlePayload {
  title: string;
  category: string;
  summary: string;
  symptoms?: string;
  solutionSteps: string;
  tags?: string[];
  sourceTicketId?: string;
  sourceTicketNumber?: string;
  authorTechnicianName: string;
}

export interface TechnicianWorkload {
  technicianName: string;
  inProgressCount: number;
  resolvedCount: number;
  totalAssigned: number;
  averageRating: number;
  status: 'DISPONIBLE' | 'OCUPADO' | 'SOBRECARGADO';
}

export interface HelpdeskMetrics {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  pausedCount: number;
  inLabCount: number;
  resolvedCount: number;
  closedCount: number;
  canceledCount: number;
  resolutionRatePercent: number;
  averageSatisfactionRating: number;
  averageResponseTimeMinutes: number;
  averageResolutionTimeHours: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  techniciansWorkload: TechnicianWorkload[];
}
