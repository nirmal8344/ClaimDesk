import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimService } from '../../services/claimService';
import { documentService } from '../../services/documentService';
import { Claim, ClaimDocument, ClaimNote, ClaimTimelineEvent, DocumentRequest, ClaimAssessment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Car,
  Heart,
  Home,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Plus,
  Send,
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  Calculator,
  Save,
  Image as ImageIcon
} from 'lucide-react';

export const OfficerClaimWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const claimId = Number(id);

  const [claim, setClaim] = useState<Claim | null>(null);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null);
  const [timeline, setTimeline] = useState<ClaimTimelineEvent[]>([]);
  const [notes, setNotes] = useState<ClaimNote[]>([]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'PHOTOS' | 'ASSESSMENT' | 'TIMELINE' | 'NOTES'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Modal: Request Document
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqDocType, setReqDocType] = useState('Repair Estimate');
  const [reqMandatory, setReqMandatory] = useState(true);
  const [reqRemarks, setReqRemarks] = useState('Please upload a clear repair estimate from the authorized service center.');
  const [reqDueDate, setReqDueDate] = useState('2024-10-20');
  const [sendingReq, setSendingReq] = useState(false);

  // Assessment Form State (matching Screenshot 2 Screen 7)
  const [assessmentDate, setAssessmentDate] = useState('2024-10-16');
  const [assessedLoss, setAssessedLoss] = useState('38000');
  const [eligibleAmount, setEligibleAmount] = useState('36000');
  const [nonEligibleAmount, setNonEligibleAmount] = useState('2000');
  const [assessmentRemarks, setAssessmentRemarks] = useState('Damage to front bumper and left headlight verified from documents. Repair estimate is reasonable.');
  const [recommendation, setRecommendation] = useState<'Approve' | 'Reject'>('Approve');
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentSuccess, setAssessmentSuccess] = useState(false);

  // Internal Notes State
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [c, d, r, a, t, n] = await Promise.all([
        claimService.getClaimById(claimId),
        claimService.getDocuments(claimId),
        claimService.getDocumentRequests(claimId),
        claimService.getAssessment(claimId),
        claimService.getTimeline(claimId),
        claimService.getNotes(claimId)
      ]);
      setClaim(c);
      setDocuments(d);
      setDocRequests(r);
      setAssessment(a);
      setTimeline(t);
      setNotes(n);

      if (a) {
        setAssessmentDate(a.assessmentDate);
        setAssessedLoss(String(a.assessedLoss));
        setEligibleAmount(String(a.eligibleAmount));
        setNonEligibleAmount(String(a.nonEligibleAmount));
        setAssessmentRemarks(a.remarks || '');
        setRecommendation(a.recommendation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) fetchData();
  }, [claimId]);

  // Document Review Action (Accept / Reject / Replacement)
  const handleReviewDocument = async (docId: number, status: string) => {
    const remarks = prompt(`Enter remarks for marking document as ${status}:`);
    if (remarks === null) return;
    try {
      await claimService.reviewDocument(docId, status, remarks);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Request Document
  const handleSendDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReq(true);
    try {
      await claimService.requestDocument(claimId, {
        documentType: reqDocType,
        isMandatory: reqMandatory,
        remarks: reqRemarks,
        dueDate: reqDueDate
      });
      setShowReqModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    } finally {
      setSendingReq(false);
    }
  };

  // Save Assessment Submit
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAssessment(true);
    setAssessmentSuccess(false);
    try {
      await claimService.saveAssessment(claimId, {
        assessmentDate,
        assessedLoss: parseFloat(assessedLoss),
        eligibleAmount: parseFloat(eligibleAmount),
        nonEligibleAmount: parseFloat(nonEligibleAmount),
        remarks: assessmentRemarks,
        recommendation
      });
      setAssessmentSuccess(true);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save assessment');
    } finally {
      setSavingAssessment(false);
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await claimService.addNote(claimId, newNote.trim(), isInternalNote);
      setNewNote('');
      const updatedNotes = await claimService.getNotes(claimId);
      setNotes(updatedNotes);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading claim workspace...</div>;
  }

  if (!claim) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Claim not found.</div>;
  }

  const photosList = documents.filter(d => d.isPhoto);
  const docsList = documents.filter(d => !d.isPhoto);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
        <Link to="/officer/claims" style={{ color: '#6C5DD3', fontWeight: 500 }}>
          Assigned Claims
        </Link>
        <span>&gt;</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>{claim.claimNumber}</span>
      </div>

      {/* Claim Header Card matching Screenshot 2 Screen 4 */}
      <div className="app-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7E22CE'
            }}>
              <Car size={26} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                  {claim.claimNumber}
                </h1>
                <StatusBadge status={claim.status} />
                <StatusBadge status={claim.priority || 'Medium'} />
              </div>
              <div style={{ fontSize: 13.5, color: '#4B5563', marginTop: 4 }}>
                {claim.policyType || claim.claimType} &bull; {claim.incidentTitle}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Requested Claim Amount</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
              ₹{claim.requestedAmount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Workspace Tabs matching Screenshot 2 Screen 4 */}
        <div style={{
          display: 'flex',
          gap: 24,
          borderBottom: '1px solid #E5E7EB',
          marginTop: 24,
          overflowX: 'auto'
        }}>
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'DOCUMENTS', label: `Documents (${docsList.length})` },
            { id: 'PHOTOS', label: `Photos (${photosList.length})` },
            { id: 'ASSESSMENT', label: 'Assessment' },
            { id: 'TIMELINE', label: 'Timeline' },
            { id: 'NOTES', label: `Notes (${notes.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: 'transparent',
                padding: '10px 0',
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === t.id ? '#6C5DD3' : '#6B7280',
                borderBottom: activeTab === t.id ? '2.5px solid #6C5DD3' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW matching Screenshot 2 Screen 4 */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Customer & Policy Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Information */}
            <div className="app-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Customer Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Name:</span> <strong>{claim.customerName}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Phone:</span> <strong>{claim.customerPhone || '+91 98765 43210'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Email:</span> <strong>{claim.customerEmail}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Address:</span> <span>{claim.customerAddress || 'No 12, Anna Nagar, Chennai'}</span></div>
              </div>
            </div>

            {/* Policy Information */}
            <div className="app-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Policy Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Policy Number:</span> <strong>{claim.policyNumber}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Company:</span> <strong>{claim.providerCompany}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Policy Type:</span> <strong>{claim.policyType}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Valid Till:</span> <strong>{claim.policyEndDate}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Coverage Limit:</span> <strong>₹{claim.policyCoverage?.toLocaleString('en-IN')}</strong></div>
              </div>
            </div>
          </div>

          {/* Incident Details & Photos Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="app-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Incident Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Incident Date:</span> <strong>{claim.incidentDate}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Location:</span> <strong>{claim.incidentLocation}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Title:</span> <strong>{claim.incidentTitle}</strong></div>
                <div><span style={{ color: '#6B7280' }}>Description:</span> <p style={{ marginTop: 4, color: '#374151' }}>{claim.incidentDescription}</p></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
                  <span style={{ color: '#6B7280' }}>Estimated Loss:</span> <strong>₹{claim.estimatedLoss?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Requested Amount:</span> <strong>₹{claim.requestedAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Photos Thumbnails matching Screenshot 2 Screen 4 */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Supporting Photos ({photosList.length})</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {photosList.length > 0 ? (
                    photosList.map((p, i) => (
                      <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                        <img src="/assets/damage_photo1.jpg" alt="damage preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <img src="/assets/damage_photo1.jpg" alt="damage preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS REVIEW matching Screenshot 2 Screen 5 */}
      {activeTab === 'DOCUMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Uploaded Documents</h2>
            <button
              onClick={() => setShowReqModal(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>Request Document</span>
            </button>
          </div>

          {/* Uploaded Documents Table matching Screenshot 2 Screen 5 */}
          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Uploaded On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: '#9CA3AF' }}>No documents uploaded.</td>
                  </tr>
                ) : (
                  docsList.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={18} color="#6C5DD3" />
                        <span style={{ fontWeight: 600 }}>{doc.fileName}</span>
                      </td>
                      <td>{doc.documentType}</td>
                      <td>{doc.uploadDate?.split('T')[0] || '12 Oct 2024'}</td>
                      <td>
                        <StatusBadge status={doc.reviewStatus} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <a
                            href={documentService.getViewUrl(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ padding: '5px 8px', fontSize: 12 }}
                            title="View Document"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => handleReviewDocument(doc.id, 'Accepted')}
                            style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                            title="Accept Document"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReviewDocument(doc.id, 'Replacement Required')}
                            style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                            title="Request Replacement"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => handleReviewDocument(doc.id, 'Rejected')}
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                            title="Reject Document"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Document Requirements Checklist matching Screenshot 2 Screen 5 */}
          <div className="app-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Document Requirements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {[
                { name: 'Accident Report', req: 'Required', status: 'Uploaded', done: true },
                { name: 'Repair Estimate', req: 'Required', status: 'Uploaded', done: true },
                { name: 'Vehicle RC Copy', req: 'Required', status: 'Uploaded', done: true },
                { name: 'Driver License', req: 'Optional', status: 'Not Uploaded', done: false },
                { name: 'Police Complaint', req: 'Optional', status: 'Not Uploaded', done: false }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: '#FAFAFD',
                    border: '1px solid #F3F4F6',
                    fontSize: 13
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.done ? <CheckCircle2 size={16} color="#10B981" /> : <Clock size={16} color="#9CA3AF" />}
                    <span style={{ fontWeight: 600, color: '#111827' }}>{item.name}</span>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>({item.req})</span>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: item.done ? '#059669' : '#9CA3AF'
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHOTOS */}
      {activeTab === 'PHOTOS' && (
        <div className="app-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Uploaded Damage Photographs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[1, 2].map((num) => (
              <div key={num} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FAFAFD' }}>
                <img
                  src={num === 1 ? '/assets/damage_photo1.jpg' : '/assets/damage_photo2.jpg'}
                  alt={`Damage photo ${num}`}
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                    {num === 1 ? 'Front Bumper Damage' : 'Left Headlamp Crack'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    Uploaded on 12 Oct 2024
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLAIM ASSESSMENT matching Screenshot 2 Screen 7 */}
      {activeTab === 'ASSESSMENT' && (
        <div className="app-card" style={{ padding: '28px 32px', maxWidth: 840 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Claim Assessment</h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
              Evaluate the claim based on documents and investigation.
            </p>
          </div>

          {/* Amount Difference Highlights */}
          <div style={{
            background: '#FAF8FF',
            border: '1px solid #EDE9FE',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Customer Requested Amount</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>
                ₹{claim.requestedAmount?.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ height: 32, width: 1, background: '#E5E7EB' }} />
            <div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Officer Assessed Loss</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#6C5DD3' }}>
                ₹{parseFloat(assessedLoss || '0').toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ height: 32, width: 1, background: '#E5E7EB' }} />
            <div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Eligible Settlement Amount</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>
                ₹{parseFloat(eligibleAmount || '0').toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {assessmentSuccess && (
            <div style={{ background: '#ECFDF5', color: '#059669', padding: '12px 16px', borderRadius: 8, fontSize: 13.5, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} />
              <span>Claim assessment saved successfully and moved to Assessment stage!</span>
            </div>
          )}

          <form onSubmit={handleSaveAssessment}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Assessment Date <span className="req">*</span></label>
                <input
                  type="date"
                  required
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assessed Loss (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={assessedLoss}
                  onChange={(e) => {
                    setAssessedLoss(e.target.value);
                    const diff = Math.max(0, parseFloat(e.target.value || '0') - parseFloat(nonEligibleAmount || '0'));
                    setEligibleAmount(String(diff));
                  }}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligible Amount (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={eligibleAmount}
                  onChange={(e) => setEligibleAmount(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Non-Eligible Amount (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={nonEligibleAmount}
                  onChange={(e) => {
                    setNonEligibleAmount(e.target.value);
                    const diff = Math.max(0, parseFloat(assessedLoss || '0') - parseFloat(e.target.value || '0'));
                    setEligibleAmount(String(diff));
                  }}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Recommendation <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="radio"
                    name="rec"
                    checked={recommendation === 'Approve'}
                    onChange={() => setRecommendation('Approve')}
                    style={{ accentColor: '#059669' }}
                  />
                  <strong style={{ color: '#059669' }}>Recommend Approval</strong>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="radio"
                    name="rec"
                    checked={recommendation === 'Reject'}
                    onChange={() => setRecommendation('Reject')}
                    style={{ accentColor: '#DC2626' }}
                  />
                  <strong style={{ color: '#DC2626' }}>Recommend Rejection</strong>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assessment Remarks / Findings</label>
              <textarea
                rows={4}
                required
                value={assessmentRemarks}
                onChange={(e) => setAssessmentRemarks(e.target.value)}
                placeholder="Damage verified against repair estimate. Parts cost verified..."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="submit"
                disabled={savingAssessment}
                className="btn-dark"
                style={{ padding: '11px 24px', fontSize: 14 }}
              >
                <Save size={16} />
                <span>{savingAssessment ? 'Saving...' : 'Save Assessment'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <div className="app-card" style={{ padding: '28px 32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 28 }}>
            Claim Timeline
          </h2>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, background: '#E5E7EB' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{
                    position: 'absolute',
                    left: -28,
                    top: 2,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '3px solid #6C5DD3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C5DD3' }} />
                  </div>

                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{event.eventName}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{event.remarks}</div>
                    {event.userName && <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>Logged by {event.userName}</div>}
                  </div>

                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {event.eventTime?.replace('T', ' ').slice(0, 16)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTES */}
      {activeTab === 'NOTES' && (
        <div className="app-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Investigation & Case Notes</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {notes.map((n) => (
              <div key={n.id} style={{
                background: n.isInternal ? '#FDF8F6' : '#F9FAFB',
                borderColor: n.isInternal ? '#FED7AA' : '#E5E7EB',
                borderWidth: 1,
                borderStyle: 'solid',
                padding: 14,
                borderRadius: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                  <div>
                    <strong>{n.userName}</strong>
                    {n.isInternal && <span style={{ marginLeft: 8, color: '#C2410C', fontWeight: 600 }}>[Internal Officer Note]</span>}
                  </div>
                  <span>{n.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                </div>
                <div style={{ fontSize: 13.5, color: '#1F2937' }}>{n.note}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote}>
            <div className="form-group">
              <label className="form-label">Add Note</label>
              <textarea
                rows={3}
                required
                placeholder="Enter investigation details, customer contact record, or findings..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#4B5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  style={{ accentColor: '#6C5DD3' }}
                />
                Mark as internal officer note (hidden from customer)
              </label>

              <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>
                <Send size={15} />
                <span>Save Note</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: REQUEST ADDITIONAL DOCUMENT matching Screenshot 2 Screen 6 */}
      <Modal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        title="Request Additional Document"
        subtitle="Request missing or additional documents from the customer."
        maxWidth={500}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowReqModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="request-doc-form"
              disabled={sendingReq}
              className="btn-dark"
            >
              {sendingReq ? 'Sending...' : 'Send Request'}
            </button>
          </>
        }
      >
        <form id="request-doc-form" onSubmit={handleSendDocRequest}>
          <div className="form-group">
            <label className="form-label">Document Type <span className="req">*</span></label>
            <select
              value={reqDocType}
              onChange={(e) => setReqDocType(e.target.value)}
              className="form-select"
            >
              <option value="Repair Estimate">Repair Estimate</option>
              <option value="Purchase Invoice">Purchase Invoice</option>
              <option value="ID Proof">ID Proof</option>
              <option value="Damage Photograph">Damage Photograph</option>
              <option value="Vehicle RC Copy">Vehicle RC Copy</option>
              <option value="Driver License">Driver License</option>
              <option value="Police Complaint">Police Complaint</option>
              <option value="Ownership Proof">Ownership Proof</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Is it Mandatory? <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mandatory"
                  checked={reqMandatory}
                  onChange={() => setReqMandatory(true)}
                  style={{ accentColor: '#6C5DD3' }}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mandatory"
                  checked={!reqMandatory}
                  onChange={() => setReqMandatory(false)}
                  style={{ accentColor: '#6C5DD3' }}
                />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks / Instructions <span className="req">*</span></label>
            <textarea
              rows={3}
              required
              value={reqRemarks}
              onChange={(e) => setReqRemarks(e.target.value)}
              placeholder="Please upload a clear repair estimate from the authorized service center..."
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Due Date <span className="req">*</span></label>
            <input
              type="date"
              required
              value={reqDueDate}
              onChange={(e) => setReqDueDate(e.target.value)}
              className="form-input"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
