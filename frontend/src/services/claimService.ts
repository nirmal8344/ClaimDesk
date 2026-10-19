import { request } from './api';
import { Claim, ClaimDocument, ClaimNote, ClaimTimelineEvent, DocumentRequest, PageResponse, Settlement, ClaimAssessment } from '../types';

export const claimService = {
  async getClaimById(id: number): Promise<Claim> {
    return request<Claim>(`/claims/${id}`);
  },

  async getTimeline(id: number): Promise<ClaimTimelineEvent[]> {
    return request<ClaimTimelineEvent[]>(`/claims/${id}/timeline`);
  },

  async getNotes(id: number): Promise<ClaimNote[]> {
    return request<ClaimNote[]>(`/claims/${id}/notes`);
  },

  async addNote(id: number, note: string, isInternal: boolean = true): Promise<ClaimNote> {
    return request<ClaimNote>(`/claims/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, isInternal }),
    });
  },

  async getDocuments(id: number, isPhoto?: boolean): Promise<ClaimDocument[]> {
    return request<ClaimDocument[]>(`/claims/${id}/documents`, {
      params: { isPhoto },
    });
  },

  async getDocumentRequests(id: number): Promise<DocumentRequest[]> {
    return request<DocumentRequest[]>(`/claims/${id}/document-requests`);
  },

  async getAssessment(id: number): Promise<ClaimAssessment | null> {
    try {
      return await request<ClaimAssessment>(`/claims/${id}/assessment`);
    } catch {
      return null;
    }
  },

  async getSettlement(id: number): Promise<Settlement | null> {
    try {
      return await request<Settlement>(`/claims/${id}/settlement`);
    } catch {
      return null;
    }
  },

  // Customer specific
  async getCustomerClaims(params?: { status?: string; search?: string; page?: number; size?: number }): Promise<PageResponse<Claim>> {
    return request<PageResponse<Claim>>('/customer/claims', { params });
  },

  async createClaim(data: any): Promise<Claim> {
    return request<Claim>('/customer/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitDraftClaim(id: number): Promise<Claim> {
    return request<Claim>(`/customer/claims/${id}/submit`, {
      method: 'PUT',
    });
  },

  // Officer specific
  async getOfficerClaims(params?: { status?: string; priority?: string; claimType?: string; search?: string; page?: number; size?: number }): Promise<PageResponse<Claim>> {
    return request<PageResponse<Claim>>('/officer/claims', { params });
  },

  async updateOfficerClaimStatus(id: number, status: string, remarks?: string): Promise<Claim> {
    return request<Claim>(`/officer/claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    });
  },

  async requestDocument(claimId: number, data: { documentType: string; isMandatory: boolean; remarks: string; dueDate?: string }): Promise<DocumentRequest> {
    return request<DocumentRequest>(`/officer/claims/${claimId}/request-document`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reviewDocument(docId: number, status: string, remarks?: string): Promise<ClaimDocument> {
    return request<ClaimDocument>(`/officer/documents/${docId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    });
  },

  async saveAssessment(claimId: number, data: any): Promise<ClaimAssessment> {
    return request<ClaimAssessment>(`/officer/claims/${claimId}/assessment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin specific
  async getAllClaimsAdmin(params?: any): Promise<PageResponse<Claim>> {
    return request<PageResponse<Claim>>('/admin/claims', { params });
  },

  async assignClaim(claimId: number, data: { officerId: number; priority?: string; remarks?: string }): Promise<Claim> {
    return request<Claim>(`/admin/claims/${claimId}/assign`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async recordDecision(claimId: number, data: { decision: string; approvedAmount?: number; remarks?: string; rejectionReason?: string }): Promise<Claim> {
    return request<Claim>(`/admin/claims/${claimId}/decision`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async recordSettlement(claimId: number, data: { settlementAmount: number; settlementDate: string; settlementReference?: string; status: string; remarks?: string }): Promise<Settlement> {
    return request<Settlement>(`/admin/claims/${claimId}/settlement`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
