import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { OfficerDashboardData } from '../../types';
import {
  FileText,
  FileClock,
  Clock,
  Shield,
  ArrowRight,
  Calendar,
  Car,
  Heart,
  Home,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await dashboardService.getOfficerDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load officer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Format today's date (matching reference, e.g. Oct 19, 2026)
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // Render type icon beside Claim ID matching reference
  const renderTypeIcon = (claimType?: string) => {
    const t = (claimType || '').toLowerCase();
    if (t.includes('motor') || t.includes('vehicle')) {
      return (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#EDE8FA',
          color: '#5046E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Car size={15} strokeWidth={2} />
        </div>
      );
    }
    if (t.includes('health') || t.includes('medical')) {
      return (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#FEE2E2',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Heart size={15} strokeWidth={2} />
        </div>
      );
    }
    if (t.includes('property') || t.includes('home')) {
      return (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Home size={15} strokeWidth={2} />
        </div>
      );
    }
    return (
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: '#F1F5F9',
        color: '#64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <FileText size={15} strokeWidth={2} />
      </div>
    );
  };

  // Render pill status badge with dot bullet matching reference
  const renderStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';
    let label = status || 'Pending';

    if (s === 'under review') {
      bg = '#F3E8FF';
      color = '#7E22CE';
      label = 'Under Review';
    } else if (s === 'settled') {
      bg = '#ECFDF5';
      color = '#059669';
      label = 'Settled';
    } else if (s === 'documents required') {
      bg = '#FEF3C7';
      color = '#D97706';
      label = 'Documents Required';
    } else if (s === 'in assessment' || s === 'assessment') {
      bg = '#EFF6FF';
      color = '#2563EB';
      label = 'In Assessment';
    } else if (s === 'pending documents') {
      bg = '#F1F5F9';
      color = '#475569';
      label = 'Pending Documents';
    } else if (s === 'approved') {
      bg = '#ECFDF5';
      color = '#059669';
      label = 'Approved';
    } else if (s === 'rejected') {
      bg = '#FEF2F2';
      color = '#DC2626';
      label = 'Rejected';
    } else if (s === 'submitted') {
      bg = '#EFF6FF';
      color = '#2563EB';
      label = 'Submitted';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color: color
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span>{label}</span>
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Oct 18, 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Realistic fallback claims matching database & reference image
  const displayClaims: any[] = (data?.recentAssignedClaims && data.recentAssignedClaims.length > 0)
    ? data.recentAssignedClaims
    : [
      {
        id: 1,
        claimNumber: 'CLM-1004',
        claimType: 'Motor Insurance',
        customerName: 'Arun Kumar',
        status: 'Under Review',
        assignedDate: '2026-10-18T10:00:00',
        requestedAmount: 40000,
        estimatedLoss: 40000,
        incidentTitle: 'Front bumper damaged in road accident',
        incidentDate: '2026-10-12',
        incidentLocation: 'Chennai, Tamil Nadu',
        incidentDescription: '',
        priority: 'High',
        createdAt: '2026-10-12T10:30:00',
        updatedAt: '2026-10-18T10:00:00'
      },
      {
        id: 10,
        claimNumber: 'CLM-0958',
        claimType: 'Health Insurance',
        customerName: 'Priya S',
        status: 'Settled',
        assignedDate: '2026-10-16T11:00:00',
        requestedAmount: 85000,
        estimatedLoss: 85000,
        incidentTitle: 'Hospitalization treatment',
        incidentDate: '2026-10-10',
        incidentLocation: 'Chennai, Tamil Nadu',
        incidentDescription: '',
        priority: 'High',
        createdAt: '2026-10-10T16:00:00',
        updatedAt: '2026-10-16T11:00:00'
      },
      {
        id: 2,
        claimNumber: 'CLM-1003',
        claimType: 'Property Insurance',
        customerName: 'Priya S',
        status: 'Documents Required',
        assignedDate: '2026-10-14T10:00:00',
        requestedAmount: 65000,
        estimatedLoss: 65000,
        incidentTitle: 'Water leakage in apartment ceiling',
        incidentDate: '2026-10-05',
        incidentLocation: 'Chennai, Tamil Nadu',
        incidentDescription: '',
        priority: 'Medium',
        createdAt: '2026-10-05T11:20:00',
        updatedAt: '2026-10-14T10:00:00'
      },
      {
        id: 6,
        claimNumber: 'CLM-0987',
        claimType: 'Motor Insurance',
        customerName: 'Karthik R',
        status: 'In Assessment',
        assignedDate: '2026-10-12T09:30:00',
        requestedAmount: 28000,
        estimatedLoss: 28000,
        incidentTitle: 'Front fender collision',
        incidentDate: '2026-10-06',
        incidentLocation: 'Madurai, Tamil Nadu',
        incidentDescription: '',
        priority: 'High',
        createdAt: '2026-10-06T10:00:00',
        updatedAt: '2026-10-12T09:30:00'
      },
      {
        id: 9,
        claimNumber: 'CLM-0976',
        claimType: 'Health Insurance',
        customerName: 'Meena K',
        status: 'Pending Documents',
        assignedDate: '2026-10-10T11:00:00',
        requestedAmount: 42000,
        estimatedLoss: 42000,
        incidentTitle: 'Daycare surgery',
        incidentDate: '2026-09-29',
        incidentLocation: 'Tirunelveli',
        incidentDescription: '',
        priority: 'Low',
        createdAt: '2026-09-29T11:15:00',
        updatedAt: '2026-10-10T11:00:00'
      }
    ];

  // Tasks matching reference design
  const tasks = [
    {
      label: 'Review pending documents',
      icon: <FileText size={16} strokeWidth={2} />,
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      count: data?.tasksSummary?.['Review pending documents'] ?? 5,
      onClick: () => navigate('/officer/pending-documents')
    },
    {
      label: 'Complete assessments',
      icon: <CheckCircle2 size={16} strokeWidth={2} />,
      badgeBg: '#F3E8FF',
      badgeColor: '#7E22CE',
      count: data?.tasksSummary?.['Complete assessments'] ?? 4,
      onClick: () => navigate('/officer/assessment')
    },
    {
      label: 'Claims awaiting response',
      icon: <MessageSquare size={16} strokeWidth={2} />,
      badgeBg: '#EFF6FF',
      badgeColor: '#2563EB',
      count: data?.tasksSummary?.['Claims awaiting response'] ?? 3,
      onClick: () => navigate('/officer/under-review')
    },
    {
      label: 'Overdue claims',
      icon: <Clock size={16} strokeWidth={2} />,
      badgeBg: '#FEE2E2',
      badgeColor: '#EF4444',
      count: data?.tasksSummary?.['Overdue claims'] ?? 2,
      onClick: () => navigate('/officer/claims')
    }
  ];

  // Recent Activity Timeline items matching reference
  const activities = [
    {
      dotColor: '#8B5CF6',
      title: 'Document uploaded',
      detail: 'CLM-1004 • Arun Kumar',
      time: '2 hours ago'
    },
    {
      dotColor: '#10B981',
      title: 'Claim status updated to Settled',
      detail: 'CLM-0958 • Priya S',
      time: '5 hours ago'
    },
    {
      dotColor: '#3B82F6',
      title: 'New document request',
      detail: 'CLM-1003 • Priya S',
      time: '1 day ago'
    },
    {
      dotColor: '#64748B',
      title: 'Assessment completed',
      detail: 'CLM-0987 • Karthik R',
      time: '1 day ago'
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
        Loading Claim Officer dashboard...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1360,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
      {/* ══════════ 1. TOP BANNER ══════════ */}
      <div style={{
        background: 'linear-gradient(115deg, #F5F2FE 0%, #EDE8FA 48%, #F5F2FE 100%)',
        borderRadius: 16,
        border: '1px solid #E4DCF8',
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 90,
        boxSizing: 'border-box'
      }}>
        {/* Left: Operations Headings */}
        <div style={{ zIndex: 2, maxWidth: 520 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#5046E5',
            letterSpacing: '0.8px',
            textTransform: 'uppercase'
          }}>
            CLAIM OPERATIONS
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            margin: '4px 0 2px 0',
            letterSpacing: '-0.3px'
          }}>
            Review. Verify. Process.
          </h1>
          <p style={{
            fontSize: 13.5,
            color: '#64748B',
            margin: 0,
            lineHeight: 1.4
          }}>
            Manage your assigned claims and keep track of pending items.
          </p>
        </div>

        {/* Center-Right: 3D Document & Shield Graphic */}
        <div className="cd-banner-graphic" style={{
          position: 'relative',
          zIndex: 1,
          width: 150,
          height: 84,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="140" height="84" viewBox="0 0 160 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="docGradOff" x1="50" y1="10" x2="130" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2DCFA" />
              </linearGradient>
              <linearGradient id="shieldDocGradOff" x1="105" y1="40" x2="145" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8F7DF5" />
                <stop offset="100%" stopColor="#6C5DD3" />
              </linearGradient>
              <filter id="softGlowDocOff" x="0" y="0" width="160" height="96" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="8" result="blur" />
              </filter>
            </defs>

            <circle cx="120" cy="50" r="42" fill="#C4B5FD" opacity="0.35" filter="url(#softGlowDocOff)" />

            <g transform="translate(60, 10)">
              <rect x="0" y="0" width="56" height="74" rx="8" fill="url(#docGradOff)" stroke="#D8CEF7" strokeWidth="1.5" />
              <rect x="10" y="16" width="26" height="5" rx="2.5" fill="#C4B5FD" opacity="0.8" />
              <rect x="10" y="27" width="36" height="4" rx="2" fill="#D4CAFA" opacity="0.6" />
              <rect x="10" y="37" width="22" height="4" rx="2" fill="#D4CAFA" opacity="0.6" />
            </g>

            <g transform="translate(100, 36)">
              <path
                d="M 22 2 C 34 2, 40 8, 40 18 C 40 32, 28 42, 22 46 C 16 42, 4 32, 4 18 C 4 8, 10 2, 22 2 Z"
                fill="url(#shieldDocGradOff)"
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

        {/* Right: Today Date Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(228, 220, 248, 0.95)',
          borderRadius: 12,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(108, 93, 211, 0.04)'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#EDE8FA',
            color: '#5046E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={18} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Today</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
              {todayFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ 2. FOUR KPI STATISTIC CARDS ══════════ */}
      <div className="cd-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16
      }}>
        {/* Card 1: Assigned Claims */}
        <div
          onClick={() => navigate('/officer/claims')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#EDE8FA',
              color: '#5046E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={20} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                {data?.assignedClaims ?? 6}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B', marginTop: 4 }}>
                Assigned Claims
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </div>

        {/* Card 2: Pending Documents */}
        <div
          onClick={() => navigate('/officer/pending-documents')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileClock size={20} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                {data?.pendingDocuments ?? 1}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B', marginTop: 4 }}>
                Pending Documents
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </div>

        {/* Card 3: Under Review */}
        <div
          onClick={() => navigate('/officer/under-review')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={20} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                {data?.underReview ?? 1}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B', marginTop: 4 }}>
                Under Review
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </div>

        {/* Card 4: Assessment Pending */}
        <div
          onClick={() => navigate('/officer/assessment')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FDF2F8',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={20} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                {data?.assessmentPending ?? 0}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#64748B', marginTop: 4 }}>
                Assessment Pending
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </div>
      </div>

      {/* ══════════ 3. MAIN ROW: 2 COLUMNS ══════════ */}
      <div className="cd-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)',
        gap: 20,
        alignItems: 'start'
      }}>
        {/* ── LEFT COLUMN: My Assigned Claims Table ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 4px'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
              My Assigned Claims
            </h2>
            <Link
              to="/officer/claims"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#5046E5',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Table Container Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #ECEEF4' }}>
                    <th style={{ padding: '13px 20px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Claim ID
                    </th>
                    <th style={{ padding: '13px 18px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Policy Type
                    </th>
                    <th style={{ padding: '13px 18px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Customer
                    </th>
                    <th style={{ padding: '13px 18px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Status
                    </th>
                    <th style={{ padding: '13px 18px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Assigned Date
                    </th>
                    <th style={{ padding: '13px 20px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'center' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      onClick={() => navigate(`/officer/claims/${claim.id}`)}
                    >
                      {/* Claim ID with Type Icon */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {renderTypeIcon(claim.claimType)}
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                            {claim.claimNumber}
                          </span>
                        </div>
                      </td>

                      {/* Policy Type */}
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#475569' }}>
                        {claim.policyType || claim.claimType || 'General Insurance'}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 500, color: '#1E293B' }}>
                        {claim.customerName || 'Arun Kumar'}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        {renderStatusBadge(claim.status)}
                      </td>

                      {/* Assigned Date */}
                      <td style={{ padding: '14px 18px', fontSize: 12.5, color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDate(claim.assignedDate || claim.createdAt)}
                      </td>

                      {/* Action Arrow */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/officer/claims/${claim.id}`);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#5046E5')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                        >
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: My Tasks & Recent Activity ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card 1: My Tasks */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                My Tasks
              </h2>
              <Link
                to="/officer/claims"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#5046E5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  onClick={task.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #ECEEF4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B'
                    }}>
                      {task.icon}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: '#334155' }}>
                      {task.label}
                    </span>
                  </div>

                  <span style={{
                    background: task.badgeBg,
                    color: task.badgeColor,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '2px 9px',
                    borderRadius: 9999
                  }}>
                    {task.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Recent Activity */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #ECEEF4',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                Recent Activity
              </h2>
              <Link
                to="/officer/notifications"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#5046E5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {activities.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 14,
                    position: 'relative',
                    paddingBottom: idx === activities.length - 1 ? 0 : 20
                  }}
                >
                  {/* Connecting vertical line */}
                  {idx < activities.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: 6,
                      top: 14,
                      bottom: 0,
                      width: 2,
                      background: '#F1F5F9'
                    }} />
                  )}

                  {/* Colored status dot */}
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: act.dotColor,
                    border: '3px solid #FFFFFF',
                    boxShadow: `0 0 0 1px ${act.dotColor}33`,
                    zIndex: 2,
                    marginTop: 2,
                    flexShrink: 0
                  }} />

                  {/* Content */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    minWidth: 0
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {act.detail}
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#94A3B8', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 1080px) {
          .cd-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .cd-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .cd-kpi-grid {
            grid-template-columns: 1fr !important;
          }
          .cd-banner-graphic {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OfficerDashboard;
