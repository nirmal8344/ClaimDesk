import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimService } from '../../services/claimService';
import { adminService } from '../../services/adminService';
import { API_BASE_URL } from '../../services/api';
import { Claim, PageResponse, User } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  Filter,
  UserCheck,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';

export const AdminClaims: React.FC = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal: Assign Officer
  const [assignModalClaim, setAssignModalClaim] = useState<Claim | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | ''>('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Modal: Decision
  const [decisionModalClaim, setDecisionModalClaim] = useState<Claim | null>(null);
  const [decisionType, setDecisionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [decisionAmount, setDecisionAmount] = useState('');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);

  // Modal: Settlement
  const [settleModalClaim, setSettleModalClaim] = useState<Claim | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleReference, setSettleReference] = useState('');
  const [settleRemarks, setSettleRemarks] = useState('');
  const [processingSettle, setProcessingSettle] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res: PageResponse<Claim> = await claimService.getOfficerClaims({
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        claimType: typeFilter === 'ALL' ? undefined : typeFilter,
        page,
        size: 10
      });
      setClaims(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await adminService.getOfficers({ page: 0, size: 50 });
      setOfficers(res.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchOfficers();
  }, [statusFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchClaims();
  };

  // Submit Officer Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalClaim || !selectedOfficerId) return;

    setAssigning(true);
    setFeedbackMsg(null);
    try {
      await fetch(`${API_BASE_URL}/admin/claims/${assignModalClaim.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('claimdesk_token')}`
        },
        body: JSON.stringify({
          officerId: Number(selectedOfficerId),
          assignmentRemarks: assignRemarks
        })
      });
      setFeedbackMsg({ type: 'success', text: `Claim #${assignModalClaim.claimNumber} assigned successfully!` });
      setAssignModalClaim(null);
      fetchClaims();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to assign claim.' });
    } finally {
      setAssigning(false);
    }
  };

  // Submit Claim Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModalClaim) return;

    setProcessingDecision(true);
    setFeedbackMsg(null);
    try {
      await fetch(`${API_BASE_URL}/admin/claims/${decisionModalClaim.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('claimdesk_token')}`
        },
        body: JSON.stringify({
          decision: decisionType,
          approvedAmount: decisionType === 'Approved' ? Number(decisionAmount) : 0,
          remarks: decisionRemarks
        })
      });
      setFeedbackMsg({ type: 'success', text: `Decision recorded for claim #${decisionModalClaim.claimNumber}` });
      setDecisionModalClaim(null);
      fetchClaims();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to record decision.' });
    } finally {
      setProcessingDecision(false);
    }
  };

  // Submit Settlement
  const handleSettlementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalClaim) return;

    setProcessingSettle(true);
    setFeedbackMsg(null);
    try {
      await fetch(`${API_BASE_URL}/admin/claims/${settleModalClaim.id}/settlement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('claimdesk_token')}`
        },
        body: JSON.stringify({
          settlementAmount: Number(settleAmount),
          settlementDate: new Date().toISOString().split('T')[0],
          settlementReference: settleReference || `TXN-${Date.now()}`,
          remarks: settleRemarks
        })
      });
      setFeedbackMsg({ type: 'success', text: `Settlement disbursed for claim #${settleModalClaim.claimNumber}!` });
      setSettleModalClaim(null);
      fetchClaims();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to record settlement.' });
    } finally {
      setProcessingSettle(false);
    }
  };

  const formatCurrency = (amt: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Claims Administration</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
            Full supervision: assign officers, override decisions, and authorize payouts.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: feedbackMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: feedbackMsg.type === 'success' ? '#059669' : '#DC2626',
          fontSize: 13.5,
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} style={{ background: 'none' }}><X size={16} /></button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="app-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 300px', maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Claim #, Customer, or Policy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input"
              style={{ paddingLeft: 36, width: '100%', fontSize: 13.5 }}
            />
          </div>
          <button type="submit" className="app-btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="app-input"
              style={{ padding: '6px 12px', fontSize: 13 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Documents Required">Documents Required</option>
              <option value="Assessment Pending">Assessment Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="app-input"
              style={{ padding: '6px 12px', fontSize: 13 }}
            >
              <option value="ALL">All Categories</option>
              <option value="Vehicle Damage">Vehicle Damage</option>
              <option value="Property Damage">Property Damage</option>
              <option value="Health">Health</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            Loading claims...
          </div>
        ) : claims.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            No claims found matching selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Customer Info</th>
                  <th>Policy</th>
                  <th>Estimated / Claimed</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.claimNumber}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.customerName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{claim.customerEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{claim.policyType}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{claim.policyNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{formatCurrency(claim.requestedAmount || claim.estimatedLoss)}</div>
                      {claim.assessedAmount ? (
                        <div style={{ fontSize: 12, color: '#059669' }}>Assessed: {formatCurrency(claim.assessedAmount)}</div>
                      ) : null}
                    </td>
                    <td>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td>
                      {claim.assignedOfficerName ? (
                        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>
                          {claim.assignedOfficerName}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '2px 8px', borderRadius: 4 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => navigate(`/officer/claims/${claim.id}`)}
                          className="app-btn-secondary"
                          title="Inspect Details"
                          style={{ padding: '6px 10px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Eye size={14} /> View
                        </button>

                        <button
                          onClick={() => {
                            setAssignModalClaim(claim);
                            setSelectedOfficerId(claim.assignedOfficerId || '');
                            setAssignRemarks('');
                          }}
                          className="app-btn-secondary"
                          title="Assign Officer"
                          style={{ padding: '6px 10px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <UserCheck size={14} /> Assign
                        </button>

                        {claim.status === 'Assessment Pending' && (
                          <button
                            onClick={() => {
                              setDecisionModalClaim(claim);
                              setDecisionAmount(String(claim.assessedAmount || claim.requestedAmount));
                              setDecisionRemarks('');
                            }}
                            className="app-btn-primary"
                            style={{ padding: '6px 10px', fontSize: 12.5 }}
                          >
                            Decide
                          </button>
                        )}

                        {claim.status === 'Approved' && (
                          <button
                            onClick={() => {
                              setSettleModalClaim(claim);
                              setSettleAmount(String(claim.eligibleAmount || claim.assessedAmount || claim.requestedAmount));
                              setSettleReference(`TXN-SETTLE-${Date.now()}`);
                              setSettleRemarks('Approved settlement disbursed');
                            }}
                            className="app-btn-primary"
                            style={{ padding: '6px 10px', fontSize: 12.5, background: '#059669' }}
                          >
                            <DollarSign size={14} /> Disburse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 13,
          color: '#6B7280'
        }}>
          <span>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="app-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="app-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Assign Officer */}
      <Modal
        isOpen={!!assignModalClaim}
        onClose={() => setAssignModalClaim(null)}
        title={assignModalClaim ? `Assign Claim #${assignModalClaim.claimNumber}` : 'Assign Claim'}
        maxWidth={480}
        footer={
          <>
            <button
              type="button"
              onClick={() => setAssignModalClaim(null)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="assign-claim-form"
              disabled={assigning || !selectedOfficerId}
              className="app-btn-primary"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form id="assign-claim-form" onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="app-label">Select Claim Officer</label>
            <select
              required
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(Number(e.target.value))}
              className="app-input"
              style={{ width: '100%' }}
            >
              <option value="">-- Choose an Officer --</option>
              {officers.map(off => (
                <option key={off.id} value={off.id}>
                  {off.fullName} ({off.department || 'Claims Officer'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="app-label">Assignment Remarks / Instructions</label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Please verify accident damage report and authorize assessment."
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Record Decision */}
      <Modal
        isOpen={!!decisionModalClaim}
        onClose={() => setDecisionModalClaim(null)}
        title={decisionModalClaim ? `Executive Decision: Claim #${decisionModalClaim.claimNumber}` : 'Executive Decision'}
        maxWidth={480}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDecisionModalClaim(null)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="decision-claim-form"
              disabled={processingDecision}
              className="app-btn-primary"
              style={{ background: decisionType === 'Approved' ? '#059669' : '#DC2626' }}
            >
              {processingDecision ? 'Recording...' : `Confirm ${decisionType}`}
            </button>
          </>
        }
      >
        <form id="decision-claim-form" onSubmit={handleDecisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="app-label">Decision Outcome</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setDecisionType('Approved')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: decisionType === 'Approved' ? '2px solid #059669' : '1px solid #E5E7EB',
                  background: decisionType === 'Approved' ? '#ECFDF5' : '#FFFFFF',
                  color: decisionType === 'Approved' ? '#059669' : '#374151',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <CheckCircle size={18} /> Approve Claim
              </button>
              <button
                type="button"
                onClick={() => setDecisionType('Rejected')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: decisionType === 'Rejected' ? '2px solid #DC2626' : '1px solid #E5E7EB',
                  background: decisionType === 'Rejected' ? '#FEF2F2' : '#FFFFFF',
                  color: decisionType === 'Rejected' ? '#DC2626' : '#374151',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <XCircle size={18} /> Reject Claim
              </button>
            </div>
          </div>

          {decisionType === 'Approved' && (
            <div>
              <label className="app-label">Approved Amount (INR)</label>
              <input
                type="number"
                required
                value={decisionAmount}
                onChange={(e) => setDecisionAmount(e.target.value)}
                className="app-input"
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label className="app-label">Decision Remarks</label>
            <textarea
              rows={3}
              required
              value={decisionRemarks}
              onChange={(e) => setDecisionRemarks(e.target.value)}
              placeholder="Official comments explaining approval or rejection justification."
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Settle Claim */}
      <Modal
        isOpen={!!settleModalClaim}
        onClose={() => setSettleModalClaim(null)}
        title={settleModalClaim ? `Disburse Payout: Claim #${settleModalClaim.claimNumber}` : 'Disburse Payout'}
        maxWidth={480}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSettleModalClaim(null)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="settle-claim-form"
              disabled={processingSettle}
              className="app-btn-primary"
              style={{ background: '#059669' }}
            >
              {processingSettle ? 'Processing...' : 'Authorize Disbursement'}
            </button>
          </>
        }
      >
        <form id="settle-claim-form" onSubmit={handleSettlementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="app-label">Settlement Amount (INR)</label>
            <input
              type="number"
              required
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="app-label">Bank Reference / Transaction ID</label>
            <input
              type="text"
              required
              value={settleReference}
              onChange={(e) => setSettleReference(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="app-label">Settlement Remarks</label>
            <textarea
              rows={2}
              value={settleRemarks}
              onChange={(e) => setSettleRemarks(e.target.value)}
              className="app-input"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
