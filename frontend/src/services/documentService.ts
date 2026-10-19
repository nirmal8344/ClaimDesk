import { request, API_BASE_URL, getAuthToken } from './api';
import { ClaimDocument } from '../types';

export const documentService = {
  async uploadFile(claimId: number, file: File, options?: { documentType?: string; isPhoto?: boolean; photoCategory?: string; description?: string }): Promise<ClaimDocument> {
    const formData = new FormData();
    formData.append('claimId', String(claimId));
    formData.append('file', file);
    if (options?.documentType) formData.append('documentType', options.documentType);
    if (options?.isPhoto !== undefined) formData.append('isPhoto', String(options.isPhoto));
    if (options?.photoCategory) formData.append('photoCategory', options.photoCategory);
    if (options?.description) formData.append('description', options.description);

    return request<ClaimDocument>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteDocument(id: number): Promise<void> {
    return request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  getViewUrl(id: number): string {
    const token = getAuthToken();
    return `${API_BASE_URL}/documents/${id}/view${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  getDownloadUrl(id: number): string {
    const token = getAuthToken();
    return `${API_BASE_URL}/documents/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};
