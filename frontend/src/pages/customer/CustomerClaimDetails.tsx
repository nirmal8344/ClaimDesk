import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimService } from '../../services/claimService';
import { documentService } from '../../services/documentService';
import { Claim, ClaimDocument, ClaimNote, ClaimTimelineEvent, DocumentRequest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Car,
  Heart,
  Home,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Upload,
  Send,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

export const CustomerClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const claimId = Number(id);

  const [claim, setClaim] = useState<Claim | null>(null);
  const [timeline, setTimeline] = useState<ClaimTimelineEvent[]>([]);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [notes, setNotes] = useState<ClaimNote[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'TIMELINE' | 'NOTES'>('TIMELINE');

  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadType, setUploadType] = useState('Repair Estimate');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [c, t, d, r, n] = await Promise.all([
        claimService.getClaimById(claimId),
        claimService.getTimeline(claimId),
        claimService.getDocuments(claimId),
        claimService.getDocumentRequests(claimId),
        claimService.getNotes(claimId)
      ]);
      setClaim(c);
      setTimeline(t);
      setDocuments(d);
      setDocRequests(r);
      setNotes(n);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) fetchData();
  }, [claimId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await claimService.addNote(claimId, newNote.trim(), false);
      setNewNote('');
      const n = await claimService.getNotes(claimId);
      setNotes(n);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCustomerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const isPhoto = file.type.startsWith('image/');
      await documentService.uploadFile(claimId, file, {
        documentType: uploadType,
        isPhoto
      });
      alert('Document uploaded successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading claim details...</div>;
  }

  if (!claim) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Claim not found.</div>;
  }

  const getPolicyIcon = (type: string) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('motor') || norm.includes('vehicle')) return <Car size={24} color="#6C5DD3" />;
    if (norm.includes('health')) return <Heart size={24} color="#EF4444" />;
    return <Home size={24} color="#3B82F6" />;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
        <Link to="/customer/claims" style={{ color: '#6C5DD3', fontWeight: 500 }}>
          My Claims
        </Link>
        <span>&gt;</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>{claim.claimNumber}</span>
      </div>

      {/* Claim Summary Header matching Screenshot 1 */}
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
              justifyContent: 'center'
            }}>
              {getPolicyIcon(claim.policyType || claim.claimType)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                  {claim.claimNumber}
                </h1>
                <StatusBadge status={claim.status} />
              </div>
              <div style={{ fontSize: 13.5, color: '#4B5563', marginTop: 4 }}>
                {claim.policyType || claim.claimType} &bull; {claim.incidentTitle}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                Submitted on {claim.createdAt?.split('T')[0] || '12 Oct 2024'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Requested Amount</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
              ₹{claim.requestedAmount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Navigation Tabs matching Screenshot 1 */}
        <div style={{
          display: 'flex',
          gap: 24,
          borderBottom: '1px solid #E5E7EB',
          marginTop: 24
        }}>
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'DOCUMENTS', label: `Documents (${documents.length})` },
            { id: 'TIMELINE', label: 'Timeline' },
            { id: 'NOTES', label: `Notes (${notes.length})` }
          ].map((t) => (
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
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: TIMELINE VIEW (Exact match to Screenshot 1) */}
      {activeTab === 'TIMELINE' && (
        <div className="app-card" style={{ padding: '28px 32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 28 }}>
            Claim Progression Timeline
          </h2>

          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Vertical timeline spine */}
            <div style={{
              position: 'absolute',
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              background: '#E5E7EB'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {timeline.map((event, idx) => {
                let nodeColor = '#6C5DD3';
                if (event.eventName.includes('Submitted')) nodeColor = '#F59E0B';
                if (event.eventName.includes('Officer')) nodeColor = '#3B82F6';
                if (event.eventName.includes('Requested')) nodeColor = '#EF4444';
                if (event.eventName.includes('Uploaded')) nodeColor = '#10B981';
                if (event.eventName.includes('Review')) nodeColor = '#6C5DD3';
                if (event.eventName.includes('Approved') || event.eventName.includes('Settled')) nodeColor = '#059669';

                return (
                  <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                    {/* Node Dot */}
                    <div style={{
                      position: 'absolute',
                      left: -28,
                      top: 2,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: `3px solid ${nodeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeColor }} />
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                          {event.eventName}
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                          {event.remarks || 'Status logged'}
                        </div>
                        {event.userName && (
                          <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>
                            By {event.userName}
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
                        {event.eventTime?.replace('T', ' ').slice(0, 16)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          {/* Incident Details Card */}
          <div className="app-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Incident Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <div><span style={{ color: '#6B7280' }}>Title:</span> <strong>{claim.incidentTitle}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Date:</span> <strong>{claim.incidentDate}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Location:</span> <strong>{claim.incidentLocation}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Description:</span> <p style={{ marginTop: 4, color: '#374151' }}>{claim.incidentDescription}</p></div>
              <div><span style={{ color: '#6B7280' }}>Estimated Loss:</span> <strong>₹{claim.estimatedLoss?.toLocaleString('en-IN')}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Requested Amount:</span> <strong>₹{claim.requestedAmount?.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          {/* Policy Information Card */}
          <div className="app-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Policy Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <div><span style={{ color: '#6B7280' }}>Policy Number:</span> <strong>{claim.policyNumber}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Company:</span> <strong>{claim.providerCompany}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Policy Type:</span> <strong>{claim.policyType}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Valid Till:</span> <strong>{claim.policyEndDate}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Coverage Limit:</span> <strong>₹{claim.policyCoverage?.toLocaleString('en-IN')}</strong></div>
            </div>

            {/* Officer Assignment Info */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6', fontSize: 13.5 }}>
              <div style={{ fontWeight: 600, color: '#111827', marginBottom: 6 }}>Assigned Officer</div>
              {claim.assignedOfficerName ? (
                <div>
                  <div style={{ color: '#374151', fontWeight: 600 }}>{claim.assignedOfficerName}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{claim.assignedOfficerEmail}</div>
                </div>
              ) : (
                <div style={{ color: '#9CA3AF' }}>Queued for assignment</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Document Requests alert banner if any */}
          {docRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <div className="app-card" style={{ padding: 20, background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#B45309', fontWeight: 700, fontSize: 15 }}>
                <AlertCircle size={20} />
                <span>Action Required: Officer Requested Documents</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {docRequests.filter(r => r.status === 'PENDING').map(req => (
                  <div key={req.id} style={{
                    background: '#FFFFFF',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{req.documentType}</div>
                      <div style={{ fontSize: 12.5, color: '#4B5563', marginTop: 2 }}>{req.remarks}</div>
                      {req.dueDate && <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 2 }}>Due: {req.dueDate}</div>}
                    </div>

                    <label className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          setUploadType(req.documentType);
                          handleCustomerUpload(e);
                        }}
                      />
                      <Upload size={14} />
                      <span>Upload {req.documentType}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents Table */}
          <div className="app-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Uploaded Files ({documents.length})</h3>
              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                <input type="file" style={{ display: 'none' }} onChange={handleCustomerUpload} />
                <Upload size={14} />
                <span>Upload File</span>
              </label>
            </div>

            <div className="app-table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#9CA3AF' }}>No files uploaded yet.</td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {doc.isPhoto ? <ImageIcon size={16} color="#6C5DD3" /> : <FileText size={16} color="#2563EB" />}
                          <span style={{ fontWeight: 600 }}>{doc.fileName}</span>
                        </td>
                        <td>{doc.documentType}</td>
                        <td>{doc.uploadDate?.split('T')[0]}</td>
                        <td>
                          <StatusBadge status={doc.reviewStatus} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <a
                            href={documentService.getDownloadUrl(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: '#6C5DD3',
                              fontWeight: 600,
                              fontSize: 12.5
                            }}
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTES */}
      {activeTab === 'NOTES' && (
        <div className="app-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Claim Notes</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {notes.length === 0 ? (
              <div style={{ color: '#9CA3AF', fontSize: 13 }}>No customer notes recorded yet.</div>
            ) : (
              notes.map((n) => (
                <div key={n.id} style={{ background: '#F9FAFB', padding: 14, borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                    <strong>{n.userName}</strong>
                    <span>{n.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: '#1F2937' }}>{n.note}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Add an inquiry or update note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
