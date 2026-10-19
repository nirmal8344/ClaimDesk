import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import { claimService } from '../../services/claimService';
import { documentService } from '../../services/documentService';
import { Policy, Claim } from '../../types';
import {
  FilePlus,
  Calendar,
  MapPin,
  ChevronDown,
  CloudUpload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Save
} from 'lucide-react';

export const NewClaimWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draftClaimId, setDraftClaimId] = useState<number | null>(draftIdParam ? Number(draftIdParam) : null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState<string | null>(null);

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  // Form Fields
  const [policyId, setPolicyId] = useState<string>('');
  const [claimType, setClaimType] = useState('Vehicle Damage');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [estimatedLoss, setEstimatedLoss] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [description, setDescription] = useState('');

  // Files State
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: string;
    fileObj?: File;
  }>>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await policyService.getCustomerPolicies('ACTIVE');
        setPolicies(res);

        if (draftIdParam) {
          try {
            const draft = await claimService.getClaimById(Number(draftIdParam));
            if (draft) {
              setDraftClaimId(draft.id);
              if (draft.policyId) {
                setPolicyId(String(draft.policyId));
              } else if (res.length > 0) {
                setPolicyId(String(res[0].id));
              }
              if (draft.claimType) setClaimType(draft.claimType);
              if (draft.incidentTitle) setIncidentTitle(draft.incidentTitle);
              if (draft.incidentDate) setIncidentDate(draft.incidentDate);
              if (draft.incidentLocation) setIncidentLocation(draft.incidentLocation);
              if (draft.estimatedLoss != null) setEstimatedLoss(String(draft.estimatedLoss));
              if (draft.requestedAmount != null) setRequestedAmount(String(draft.requestedAmount));
              if (draft.incidentDescription) setDescription(draft.incidentDescription);
            }
          } catch (draftErr) {
            console.error('Could not load draft claim:', draftErr);
          }
        } else if (res.length > 0) {
          setPolicyId(String(res[0].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPolicies(false);
      }
    }
    loadInitialData();
  }, [draftIdParam]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: Array<{ name: string; size: string; fileObj?: File }> = [];

    Array.from(files).forEach((file) => {
      // Validate file size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newItems.push({
        name: file.name,
        size: `${sizeMb} MB`,
        fileObj: file
      });
    });

    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!policyId) {
      setErrorMsg('Please select a valid policy');
      return;
    }
    if (!incidentTitle.trim()) {
      setErrorMsg('Incident title is required');
      return;
    }
    if (!incidentDate) {
      setErrorMsg('Incident date is required');
      return;
    }
    if (!incidentLocation.trim()) {
      setErrorMsg('Incident location is required');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Incident description is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await claimService.createClaim({
        claimId: draftClaimId || undefined,
        policyId: Number(policyId),
        claimType,
        incidentTitle: incidentTitle.trim(),
        incidentDate,
        incidentLocation: incidentLocation.trim(),
        incidentDescription: description.trim(),
        estimatedLoss: parseFloat(estimatedLoss) || 0,
        requestedAmount: parseFloat(requestedAmount) || 0,
        isDraft: false
      });

      // Upload files
      for (const item of uploadedFiles) {
        if (item.fileObj) {
          try {
            const isPhoto = /\.(jpg|jpeg|png)$/i.test(item.name);
            await documentService.uploadFile(res.id, item.fileObj, {
              documentType: isPhoto ? 'Damage Photograph' : 'Repair Estimate',
              isPhoto
            });
          } catch (fileErr) {
            console.error('File upload error:', fileErr);
          }
        }
      }

      setSubmittedClaim(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!policyId) {
      setErrorMsg('Please select a policy before saving draft');
      return;
    }
    setSavingDraft(true);
    setErrorMsg(null);
    setDraftSavedMsg(null);
    try {
      const res = await claimService.createClaim({
        claimId: draftClaimId || undefined,
        policyId: Number(policyId),
        claimType,
        incidentTitle: incidentTitle.trim() || 'Untitled Draft Claim',
        incidentDate: incidentDate || new Date().toISOString().split('T')[0],
        incidentLocation: incidentLocation.trim() || 'Pending',
        incidentDescription: description.trim() || 'Draft in progress',
        estimatedLoss: parseFloat(estimatedLoss) || 0,
        requestedAmount: parseFloat(requestedAmount) || 0,
        isDraft: true
      });

      setDraftClaimId(res.id);

      // Upload any staged files
      for (const item of uploadedFiles) {
        if (item.fileObj) {
          try {
            const isPhoto = /\.(jpg|jpeg|png)$/i.test(item.name);
            await documentService.uploadFile(res.id, item.fileObj, {
              documentType: isPhoto ? 'Damage Photograph' : 'Repair Estimate',
              isPhoto
            });
          } catch (fileErr) {
            console.error('File upload error:', fileErr);
          }
        }
      }

      setDraftSavedMsg(`Draft saved successfully (Claim #${res.claimNumber || res.id})`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Success Confirmation Screen
  if (submittedClaim) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24,
          border: '1px solid #ECEEF4',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
            Claim Submitted Successfully!
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Your claim reference is <strong style={{ color: '#111827' }}>{submittedClaim.claimNumber}</strong>. Our claims team will review your submission and notify you of updates.
          </p>

          <div style={{
            background: '#F9F8FE',
            border: '1px solid #EBE6FA',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Policy</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>
                {submittedClaim.policyNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Requested</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>
                ₹{submittedClaim.requestedAmount?.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Status</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7E22CE', marginTop: 2 }}>
                {submittedClaim.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/customer/claims')}
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                padding: '11px 24px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Track Claims
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              style={{
                background: '#FFFFFF',
                color: '#374151',
                padding: '11px 24px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Common style constants for reference-matching dimensions
  const LABEL_STYLE: React.CSSProperties = {
    display: 'block',
    fontSize: 13.5,
    fontWeight: 700,
    color: '#1E293B',
    marginBottom: 8
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    fontSize: 14,
    color: '#1E293B',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const SELECT_STYLE: React.CSSProperties = {
    ...INPUT_STYLE,
    padding: '8px 40px 8px 14px',
    appearance: 'none' as const,
    cursor: 'pointer'
  };

  const ICON_OVERLAY: React.CSSProperties = {
    position: 'absolute' as const,
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const
  };

  return (
    <div style={{
      maxWidth: 1360,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      {/* ══════════ TOP BANNER — matches reference height & spacing ══════════ */}
      <div style={{
        background: 'linear-gradient(115deg, #F5F2FE 0%, #EDE8FA 48%, #F5F2FE 100%)',
        borderRadius: 16,
        border: '1px solid #E4DCF8',
        padding: '22px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 88,
        boxSizing: 'border-box'
      }}>
        {/* Left: Icon & Headings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 2, maxWidth: 620 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#EDE8FA',
            color: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #DFD7F6',
            flexShrink: 0
          }}>
            <FilePlus size={24} strokeWidth={2.2} />
          </div>

          <div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px'
            }}>
              Submit a New Claim
            </h1>
            <p style={{
              fontSize: 13.5,
              color: '#64748B',
              margin: 0,
              lineHeight: 1.5
            }}>
              Provide the details of your claim. Our team will review and get back to you soon.
            </p>
          </div>
        </div>

        {/* Right: Soft 3D Document & Shield Illustration */}
        <div className="cd-banner-graphic" style={{
          position: 'relative',
          zIndex: 1,
          width: 160,
          height: 88,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <svg width="150" height="88" viewBox="0 0 160 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="docGrad" x1="50" y1="10" x2="130" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2DCFA" />
              </linearGradient>
              <linearGradient id="shieldDocGrad" x1="105" y1="40" x2="145" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8F7DF5" />
                <stop offset="100%" stopColor="#6C5DD3" />
              </linearGradient>
              <filter id="softGlowDoc" x="0" y="0" width="160" height="96" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="8" result="blur" />
              </filter>
            </defs>

            {/* Ambient Back Glow */}
            <circle cx="120" cy="50" r="42" fill="#C4B5FD" opacity="0.35" filter="url(#softGlowDoc)" />

            {/* Document Card */}
            <g transform="translate(60, 10)">
              <rect x="0" y="0" width="56" height="74" rx="8" fill="url(#docGrad)" stroke="#D8CEF7" strokeWidth="1.5" />
              {/* Document Text Lines */}
              <rect x="10" y="16" width="26" height="5" rx="2.5" fill="#C4B5FD" opacity="0.8" />
              <rect x="10" y="27" width="36" height="4" rx="2" fill="#D4CAFA" opacity="0.6" />
              <rect x="10" y="37" width="22" height="4" rx="2" fill="#D4CAFA" opacity="0.6" />
            </g>

            {/* Overlapping Shield with Checkmark */}
            <g transform="translate(100, 36)">
              <path
                d="M 22 2 C 34 2, 40 8, 40 18 C 40 32, 28 42, 22 46 C 16 42, 4 32, 4 18 C 4 8, 10 2, 22 2 Z"
                fill="url(#shieldDocGrad)"
              />
              <path
                d="M 15 22 L 20 27 L 30 15"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* ══════════ MAIN FORM CONTAINER ══════════ */}
      <form onSubmit={handleSubmitClaim} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Main Form Card — clean white card containing all form fields */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #ECEEF4',
          padding: '32px 36px 32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 16px rgba(0, 0, 0, 0.02)',
          boxSizing: 'border-box'
        }}>
        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FEE2E2',
            padding: '12px 18px',
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {draftSavedMsg && (
          <div style={{
            background: '#EEF2FF',
            color: '#4F46E5',
            border: '1px solid #E0E7FF',
            padding: '12px 18px',
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{draftSavedMsg}</span>
          </div>
        )}

        {/* ── Row 1: Select Policy + Claim Type ── */}
        <div className="cd-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 22
        }}>
          {/* Select Policy */}
          <div>
            <label style={LABEL_STYLE}>
              Select Policy <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                required
                style={SELECT_STYLE}
              >
                {policies.length > 0 ? (
                  policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.policyType} ({p.providerCompany || 'Aegis Insurance'})
                    </option>
                  ))
                ) : (
                  <option value="">
                    {loadingPolicies ? 'Loading policies...' : 'MI-2024-001 - Motor Insurance (Aegis Insurance)'}
                  </option>
                )}
              </select>
              <ChevronDown size={17} color="#64748B" style={ICON_OVERLAY} />
            </div>
          </div>

          {/* Claim Type */}
          <div>
            <label style={LABEL_STYLE}>
              Claim Type <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                required
                style={SELECT_STYLE}
              >
                <option value="Vehicle Damage">Vehicle Damage</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Travel">Travel</option>
                <option value="Electronics/Device">Electronics/Device</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown size={17} color="#64748B" style={ICON_OVERLAY} />
            </div>
          </div>
        </div>

        {/* ── Row 2: Incident Title (full width) ── */}
        <div style={{ marginBottom: 22 }}>
          <label style={LABEL_STYLE}>
            Incident Title <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={incidentTitle}
            onChange={(e) => setIncidentTitle(e.target.value)}
            placeholder="Front bumper damaged in road accident"
            style={INPUT_STYLE}
          />
        </div>

        {/* ── Row 3: Date of Incident + Location of Incident ── */}
        <div className="cd-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 22
        }}>
          {/* Date of Incident */}
          <div>
            <label style={LABEL_STYLE}>
              Date of Incident <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="cd-date-input"
                style={{
                  ...INPUT_STYLE,
                  padding: '8px 40px 8px 14px',
                  color: incidentDate ? '#1E293B' : '#94A3B8'
                }}
              />
              <Calendar size={17} color="#64748B" style={ICON_OVERLAY} />
            </div>
          </div>

          {/* Location of Incident */}
          <div>
            <label style={LABEL_STYLE}>
              Location of Incident <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="Enter location (e.g. Chennai, Tamil Nadu)"
                style={{
                  ...INPUT_STYLE,
                  padding: '8px 40px 8px 14px'
                }}
              />
              <MapPin size={17} color="#64748B" style={ICON_OVERLAY} />
            </div>
          </div>
        </div>

        {/* ── Row 4: Estimated Loss + Requested Claim Amount ── */}
        <div className="cd-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 22
        }}>
          {/* Estimated Loss */}
          <div>
            <label style={LABEL_STYLE}>
              Estimated Loss (₹) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={estimatedLoss}
              onChange={(e) => setEstimatedLoss(e.target.value)}
              placeholder="40000"
              style={INPUT_STYLE}
            />
          </div>

          {/* Requested Claim Amount */}
          <div>
            <label style={LABEL_STYLE}>
              Requested Claim Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder="40000"
              style={INPUT_STYLE}
            />
          </div>
        </div>

        {/* ── Row 5: Incident Description with Character Counter ── */}
        <div style={{ marginBottom: 22 }}>
          <label style={LABEL_STYLE}>
            Incident Description <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, how it occurred, and any additional details..."
              style={{
                width: '100%',
                minHeight: 90,
                padding: '12px 14px 24px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 14,
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.55,
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            />
            <div style={{
              position: 'absolute',
              right: 14,
              bottom: 8,
              fontSize: 11.5,
              color: '#94A3B8',
              pointerEvents: 'none'
            }}>
              {description.length}/500
            </div>
          </div>
        </div>

        {/* ── Row 6: Upload Documents & Photos ── */}
        <div style={{ marginBottom: 24 }}>
          <label style={LABEL_STYLE}>
            Upload Documents & Photos <span style={{ color: '#EF4444' }}>*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '1.5px dashed #4F46E5' : '1.5px dashed #C4B5FD',
              borderRadius: 12,
              background: isDragging ? '#F4F0FE' : '#FAF9FE',
              padding: '22px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              transition: 'all 0.2s ease'
            }}
          >
            <CloudUpload size={34} strokeWidth={1.8} color="#4F46E5" style={{ flexShrink: 0 }} />

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, color: '#475569' }}>
                Drag and drop files here, or{' '}
                <span style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'underline' }}>click to upload</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
                Supports JPG, PNG, PDF (Max 5MB each)
              </div>
            </div>
          </div>

          {/* Attached Files Pill List */}
          {uploadedFiles.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 12
            }}>
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#F1F3FA',
                    border: '1px solid #E2E8F0',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#334155'
                  }}
                >
                  <FileText size={15} color="#6C5DD3" />
                  <span style={{ fontWeight: 500 }}>{file.name}</span>
                  <span style={{ color: '#94A3B8', fontSize: 11.5 }}>({file.size})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* End of Upload Documents & Photos */}
      </div>
      {/* End of Main Form Card */}

        {/* ── Bottom Action Buttons — positioned outside the card at bottom-right ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 14,
          paddingBottom: 16
        }}>
          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate('/customer/dashboard')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '11px 32px',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            Cancel
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            disabled={savingDraft || submitting}
            onClick={handleSaveDraft}
            style={{
              background: '#FFFFFF',
              border: '1px solid #C7D2FE',
              borderRadius: 10,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: '#4F46E5',
              cursor: (savingDraft || submitting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
              opacity: (savingDraft || submitting) ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!savingDraft && !submitting) e.currentTarget.style.background = '#F5F3FF';
            }}
            onMouseLeave={(e) => {
              if (!savingDraft && !submitting) e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            <Save size={16} strokeWidth={2.2} />
            <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          {/* Submit Claim Button */}
          <button
            type="submit"
            disabled={submitting || savingDraft}
            style={{
              background: '#4F46E5',
              border: 'none',
              borderRadius: 10,
              padding: '11px 26px',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
              opacity: submitting ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = '#4338CA';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.background = '#4F46E5';
            }}
          >
            <span>{submitting ? 'Submitting...' : 'Submit Claim'}</span>
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        </div>
      </form>

      {/* Responsive Breakpoints & Input CSS */}
      <style>{`
        .cd-date-input::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .cd-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .cd-banner-graphic {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NewClaimWizard;
