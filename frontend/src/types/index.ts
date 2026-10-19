export type Role = 'CUSTOMER' | 'CLAIM_OFFICER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string;
  department?: string;
  employeeId?: string;
  address?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
  status: string;
  employeeId?: string;
  department?: string;
  phoneNumber?: string;
  address?: string;
}

export interface Policy {
  id: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  policyNumber: string;
  policyType: string;
  providerCompany: string;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  premiumAmount: number;
  premiumTerm?: string;
  coverageDescription?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt?: string;
}

export interface Claim {
  id: number;
  claimNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;

  policyId: number;
  policyNumber: string;
  policyType: string;
  providerCompany: string;
  policyCoverage: number;
  policyEndDate: string;

  claimType: string;
  incidentTitle: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  estimatedLoss: number;
  requestedAmount: number;
  additionalRemarks?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High';

  assignedOfficerId?: number;
  assignedOfficerName?: string;
  assignedOfficerEmail?: string;
  assignedDate?: string;
  assignmentRemarks?: string;

  rejectionReason?: string;
  rejectionRemarks?: string;
  rejectionDate?: string;

  createdAt: string;
  updatedAt?: string;

  documentsCount: number;
  photosCount: number;
  daysInReview: number;
  isAssessed?: boolean;
  assessedAmount?: number;
  eligibleAmount?: number;
  settledAmount?: number;
  settlementStatus?: string;
  settlementReference?: string;
}

export interface ClaimDocument {
  id: number;
  claimId: number;
  documentType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isPhoto: boolean;
  photoCategory?: string;
  description?: string;
  uploadedById?: number;
  uploadedByName?: string;
  uploadDate: string;
  reviewStatus: 'Pending Review' | 'Accepted' | 'Rejected' | 'Replacement Required';
  officerRemarks?: string;
  downloadUrl: string;
}

export interface DocumentRequest {
  id: number;
  claimId: number;
  officerId: number;
  officerName: string;
  documentType: string;
  isMandatory: boolean;
  remarks: string;
  dueDate?: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  requestedAt: string;
  fulfilledAt?: string;
}

export interface ClaimAssessment {
  id: number;
  claimId: number;
  officerId: number;
  officerName: string;
  assessmentDate: string;
  assessedLoss: number;
  eligibleAmount: number;
  nonEligibleAmount: number;
  remarks?: string;
  recommendation: 'Approve' | 'Reject';
  createdAt: string;
}

export interface Settlement {
  id: number;
  claimId: number;
  claimNumber: string;
  approvedAmount: number;
  settlementAmount: number;
  settlementDate: string;
  settlementReference: string;
  status: 'Pending' | 'Processing' | 'Completed';
  remarks?: string;
  createdAt: string;
}

export interface ClaimTimelineEvent {
  id: number;
  claimId: number;
  eventName: string;
  userId?: number;
  userName?: string;
  remarks?: string;
  eventTime: string;
}

export interface ClaimNote {
  id: number;
  claimId: number;
  userId: number;
  userName: string;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'CLAIM' | 'DOCUMENT' | 'ASSIGNMENT' | 'SETTLEMENT' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  category: string;
}

export interface CustomerFeedback {
  id: number;
  customerId: number;
  customerName?: string;
  claimId?: number;
  rating: number;
  comments?: string;
  createdAt: string;
}

export interface CustomerDashboardData {
  activePolicies: number;
  totalClaims: number;
  underReview: number;
  settled: number;
  documentsPending: number;
  approved: number;
  recentClaims: Claim[];
  activePoliciesList: Policy[];
}

export interface OfficerDashboardData {
  assignedClaims: number;
  pendingDocuments: number;
  underReview: number;
  assessmentPending: number;
  approvedClaims: number;
  rejectedClaims: number;
  settlementPending: number;
  newClaims: number;
  recentAssignedClaims: Claim[];
  tasksSummary: Record<string, number>;
  statusOverview: Record<string, number>;
}

export interface AdminDashboardData {
  totalClaims: number;
  newClaims: number;
  underReview: number;
  documentsPending: number;
  approved: number;
  rejected: number;
  settled: number;
  totalSettlementAmount: number;
  claimsByType: Record<string, number>;
  claimsByStatus: Record<string, number>;
  monthlyClaims: Array<{ month: string; submitted: number; settled: number }>;
  settlementTrend: Array<{ month: string; amount: number }>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}
