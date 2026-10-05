import {
  Ticket,
  CreateTicketPayload,
  TakeTicketPayload,
  UpdateTicketStatusPayload,
  AddTechnicalDetailPayload,
  AddSupplyToTicketPayload,
  AssignProvisionalAssetPayload,
  ReturnProvisionalAssetPayload,
  UserConformityPayload,
  KnowledgeArticle,
  CreateKnowledgeArticlePayload,
  HelpdeskMetrics,
} from '../types/helpdesk';
import { ApiResponse } from '../types/module';

const getBaseUrl = (): string => {
  return (
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    'http://localhost:4000'
  );
};

export const helpdeskService = {
  async getTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    officeName?: string;
    technicianId?: string;
    search?: string;
  }): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.officeName) params.append('officeName', filters.officeName);
    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets?${params.toString()}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<Ticket[]> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener tickets');
    return json.data;
  },

  async getMyTickets(applicantName?: string, officeName?: string): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (applicantName) params.append('applicantName', applicantName);
    if (officeName) params.append('officeName', officeName);

    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/my-tickets?${params.toString()}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<Ticket[]> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener mis tickets');
    return json.data;
  },

  async lookupAsset(code: string): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/lookup-asset?code=${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) throw new Error(json.message || 'Activo no encontrado');
    return json.data;
  },

  async getTicketById(id: string): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener ticket');
    return json.data;
  },

  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al registrar ticket');
    return json.data;
  },

  async takeTicket(id: string, payload: TakeTicketPayload): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/take`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al tomar ticket');
    return json.data;
  },

  async updateStatus(id: string, payload: UpdateTicketStatusPayload): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al actualizar estado del ticket');
    return json.data;
  },

  async reassignTicket(id: string, payload: { technicianId?: string; technicianName: string; technicianPhone?: string; reason?: string; assignedBy: string }): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al reasignar ticket');
    return json.data;
  },

  async addTechnicalDetail(id: string, payload: AddTechnicalDetailPayload): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/technical-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al guardar diagnóstico y solución');
    return json.data;
  },

  async addSupply(id: string, payload: AddSupplyToTicketPayload): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/supplies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al descargar insumo para el ticket');
    return json.data;
  },

  async assignProvisional(id: string, payload: AssignProvisionalAssetPayload): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/loans/provisional`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al asignar activo provisional');
    return json.data;
  },

  async returnProvisional(loanId: string, payload: ReturnProvisionalAssetPayload): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/loans/${loanId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<any> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al devolver componente provisional');
    return json.data;
  },

  async userConformity(id: string, payload: UserConformityPayload): Promise<Ticket> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/tickets/${id}/conformity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<Ticket> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al registrar conformidad');
    return json.data;
  },

  async getKnowledgeArticles(category?: string, search?: string): Promise<KnowledgeArticle[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/knowledge-base?${params.toString()}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<KnowledgeArticle[]> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener base de conocimiento');
    return json.data;
  },

  async getKnowledgeArticleById(id: string): Promise<KnowledgeArticle> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/knowledge-base/${id}`, {
      cache: 'no-store',
    });
    const json: ApiResponse<KnowledgeArticle> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener artículo');
    return json.data;
  },

  async createKnowledgeArticle(payload: CreateKnowledgeArticlePayload): Promise<KnowledgeArticle> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/knowledge-base`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<KnowledgeArticle> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al publicar artículo');
    return json.data;
  },

  async markArticleHelpful(id: string): Promise<{ helpfulCount: number }> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/knowledge-base/${id}/helpful`, {
      method: 'POST',
    });
    const json: ApiResponse<{ helpfulCount: number }> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al votar');
    return json.data;
  },

  async getMetrics(): Promise<HelpdeskMetrics> {
    const res = await fetch(`${getBaseUrl()}/api/v1/helpdesk/metrics`, {
      cache: 'no-store',
    });
    const json: ApiResponse<HelpdeskMetrics> = await res.json();
    if (!json.success) throw new Error(json.message || 'Error al obtener métricas de helpdesk');
    return json.data;
  },
};
