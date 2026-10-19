import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { CustomerDashboardData } from '../../types';
import {
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Car,
  Heart,
  Home,
  ArrowRight,
  ClipboardList,
  MoreVertical
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await dashboardService.getCustomerDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const getPolicyIcon = (type: string) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('motor') || norm.includes('vehicle') || norm.includes('car')) {
      return <Car size={18} color="#6C5DD3" />;
    }
    if (norm.includes('health') || norm.includes('medical')) {
      return <Heart size={18} color="#EF4444" />;
    }
    return <Home size={18} color="#3B82F6" />;
  };

  const getPolicyBoxBg = (type: string) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('motor') || norm.includes('vehicle') || norm.includes('car')) {
      return '#EDE9FE';
    }
    if (norm.includes('health') || norm.includes('medical')) {
      return '#FEE2E2';
    }
    return '#EFF6FF';
  };

  const getDisplayPolicyType = (policy: any) => {
    const desc = (policy.coverageDescription || '').toLowerCase();
    if (desc.startsWith('comprehensive') || desc.includes('comprehensive')) return 'Comprehensive';
    if (desc.startsWith('family floater') || desc.includes('floater')) return 'Family Floater';
    return policy.coverageDescription?.split(' ')[0] || (policy.policyType?.includes('Motor') ? 'Comprehensive' : 'Standard');
  };

  const renderStatusBadge = (status: string) => {
    const norm = (status || '').toLowerCase();
    let bg = '#F3E8FF';
    let text = '#7E22CE';
    let dot = '#7E22CE';

    if (norm.includes('settled') || norm.includes('approved')) {
      bg = '#ECFDF5';
      text = '#059669';
      dot = '#10B981';
    } else if (norm.includes('reject')) {
      bg = '#FEF2F2';
      text = '#DC2626';
      dot = '#EF4444';
    } else if (norm.includes('doc') || norm.includes('pending')) {
      bg = '#FFFBEB';
      text = '#D97706';
      dot = '#F59E0B';
    } else if (norm.includes('submit')) {
      bg = '#EFF6FF';
      text = '#2563EB';
      dot = '#3B82F6';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 9999,
        background: bg,
        color: text,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dot
        }} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
        Loading your dashboard...
      </div>
    );
  }

  const customerName = user?.fullName || 'Arun Kumar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* Top Row: Hero Banner (Left) + Quick Actions (Right) */}
      <div className="cd-hero-row" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 20,
        alignItems: 'stretch'
      }}>
        {/* Welcome Banner matching UI Reference */}
        <div style={{
          background: 'linear-gradient(115deg, #ECE8FA 0%, #F5F2FF 45%, #EBE5FA 100%)',
          borderRadius: 22,
          border: '1px solid #E2DCF8',
          padding: '32px 38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 180,
          boxSizing: 'border-box'
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            right: 120,
            top: -20,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.45) 0%, rgba(245, 242, 255, 0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Banner Text Content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.8px',
              color: '#6C5DD3',
              textTransform: 'uppercase',
              marginBottom: 10
            }}>
              WELCOME BACK, {customerName.toUpperCase()}
            </div>
            <h1 style={{
              fontSize: 'clamp(26px, 2.6vw, 34px)',
              fontWeight: 800,
              color: '#131522',
              lineHeight: 1.15,
              letterSpacing: '-0.6px',
              margin: '0 0 12px 0'
            }}>
              Your Protection,<br />Our Priority.
            </h1>
            <p style={{
              fontSize: 14.5,
              color: '#64748B',
              lineHeight: 1.5,
              margin: 0
            }}>
              Manage your policies, track claims and stay secure – all in one place.
            </p>
          </div>

          {/* 3D Shield Illustration matching the reference graphic */}
          <div className="cd-shield-wrapper" style={{
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
            width: 190,
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="190" height="160" viewBox="0 0 190 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Pedestal Gradients */}
                <linearGradient id="pedestalBase" x1="95" y1="125" x2="95" y2="152" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#DFD8F9" />
                  <stop offset="100%" stopColor="#CEC5F3" />
                </linearGradient>
                <linearGradient id="pedestalRim" x1="25" y1="128" x2="165" y2="136" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#EAE5FB" />
                  <stop offset="100%" stopColor="#D2C8F6" />
                </linearGradient>
                {/* Shield Outer Body */}
                <linearGradient id="shieldRim" x1="45" y1="15" x2="145" y2="115" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EDE9FE" />
                  <stop offset="40%" stopColor="#C4B5FD" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                {/* Shield Inner Face */}
                <linearGradient id="shieldFace" x1="95" y1="26" x2="95" y2="108" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8B78F6" />
                  <stop offset="100%" stopColor="#6C5DD3" />
                </linearGradient>
                {/* Glow Filter */}
                <filter id="shieldGlow" x="0" y="0" width="190" height="160" filterUnits="userSpaceOnUse">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                </filter>
                <filter id="softShadow" x="30" y="20" width="130" height="120" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#6C5DD3" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Ambient Glow */}
              <circle cx="95" cy="70" r="55" fill="#C4B5FD" opacity="0.35" filter="url(#shieldGlow)" />

              {/* Pedestal Bottom Shadow */}
              <ellipse cx="95" cy="144" rx="60" ry="11" fill="#B4A6EC" opacity="0.45" />

              {/* Pedestal Cylindrical Base */}
              <path d="M 40 132 C 40 132, 40 144, 40 144 C 40 151, 65 155, 95 155 C 125 155, 150 151, 150 144 C 150 144, 150 132, 150 132 Z" fill="url(#pedestalBase)" />

              {/* Pedestal Top Surface */}
              <ellipse cx="95" cy="132" rx="55" ry="11" fill="url(#pedestalRim)" />

              {/* Floating Shield with Shadow */}
              <g filter="url(#softShadow)">
                {/* Shield Outer Rim */}
                <path
                  d="M 95 24 
                     C 126 24, 137 36, 137 62 
                     C 137 87, 115 106, 95 116 
                     C 75 106, 53 87, 53 62 
                     C 53 36, 64 24, 95 24 Z"
                  fill="url(#shieldRim)"
                />

                {/* Shield Inner Face */}
                <path
                  d="M 95 31 
                     C 120 31, 129 41, 129 63 
                     C 129 83, 111 99, 95 108 
                     C 79 99, 61 83, 61 63 
                     C 61 41, 70 31, 95 31 Z"
                  fill="url(#shieldFace)"
                />

                {/* Glossy Curved Highlight */}
                <path
                  d="M 95 33 
                     C 114 33, 123 41, 125 58 
                     C 115 62, 102 60, 95 55 
                     C 88 50, 78 45, 65 52 
                     C 67 40, 76 33, 95 33 Z"
                  fill="#FFFFFF"
                  opacity="0.32"
                />

                {/* Checkmark inside Shield */}
                <path
                  d="M 80 66 L 91 77 L 111 54"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Quick Actions Card matching UI Reference */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          border: '1px solid #ECEEF4',
          padding: '24px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 14px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
            margin: 0
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 18
          }}>
            {/* Action 1: File a Claim */}
            <button
              onClick={() => navigate('/customer/new-claim')}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#6C5DD3',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(108, 93, 211, 0.32)',
                transition: 'transform 0.15s ease'
              }}>
                <Plus size={22} strokeWidth={2.6} />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                marginTop: 9,
                textAlign: 'center'
              }}>
                File a Claim
              </span>
            </button>

            {/* Action 2: View Policies */}
            <button
              onClick={() => navigate('/customer/policies')}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#F4F0FD',
                color: '#6C5DD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ECE7FA',
                transition: 'transform 0.15s ease'
              }}>
                <FileText size={20} strokeWidth={2.2} />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                marginTop: 9,
                textAlign: 'center'
              }}>
                View Policies
              </span>
            </button>

            {/* Action 3: Track Claims (Replaced Get Support) */}
            <button
              onClick={() => navigate('/customer/claims')}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#F4F0FD',
                color: '#6C5DD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ECE7FA',
                transition: 'transform 0.15s ease'
              }}>
                <ClipboardList size={20} strokeWidth={2.2} />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                marginTop: 9,
                textAlign: 'center'
              }}>
                Track Claims
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: 4 Metric Cards in a Grid */}
      <div className="cd-metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 18
      }}>
        {/* Metric 1: Active Policies */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #ECEEF4',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#EDE9FE',
              color: '#6C5DD3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {data?.activePolicies ?? 2}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500, marginTop: 3 }}>
                Active Policies
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#059669',
            background: '#ECFDF5',
            padding: '2px 8px',
            borderRadius: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}>
            &uarr; 0%
          </span>
        </div>

        {/* Metric 2: Total Claims */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #ECEEF4',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {data?.totalClaims ?? 3}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500, marginTop: 3 }}>
                Total Claims
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#2563EB',
            background: '#EFF6FF',
            padding: '2px 8px',
            borderRadius: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}>
            ~ 0%
          </span>
        </div>

        {/* Metric 3: Under Review */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #ECEEF4',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#FFFBEB',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {data?.underReview ?? 1}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500, marginTop: 3 }}>
                Under Review
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#D97706',
            background: '#FFFBEB',
            padding: '2px 8px',
            borderRadius: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}>
            ~ 0%
          </span>
        </div>

        {/* Metric 4: Settled Claims */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #ECEEF4',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {data?.settled ?? 1}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500, marginTop: 3 }}>
                Settled Claims
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#059669',
            background: '#ECFDF5',
            padding: '2px 8px',
            borderRadius: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}>
            &uarr; 0%
          </span>
        </div>
      </div>

      {/* Row 3: Two Columns (Recent Claims & My Active Policies) */}
      <div className="cd-tables-row" style={{
        display: 'grid',
        gridTemplateColumns: '1.18fr 0.96fr',
        gap: 20,
        alignItems: 'start'
      }}>
        {/* Left Column: Recent Claims */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          border: '1px solid #ECEEF4',
          padding: '24px 26px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
              Recent Claims
            </h2>
            <Link
              to="/customer/claims"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#6C5DD3',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View All</span>
              <span style={{ fontSize: 14 }}>&rarr;</span>
            </Link>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F3F8' }}>
                  <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Claim ID</th>
                  <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Type</th>
                  <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Date</th>
                  <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Status</th>
                  <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#94A3B8', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentClaims && data.recentClaims.length > 0 ? (
                  data.recentClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => navigate(`/customer/claims/${claim.id}`)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #F8FAFD',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F8FE')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Claim ID + Icon */}
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: getPolicyBoxBg(claim.policyType || claim.claimType),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {getPolicyIcon(claim.policyType || claim.claimType)}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                            {claim.claimNumber}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748B' }}>
                        {claim.policyType || claim.claimType}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748B' }}>
                        {claim.incidentDate}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 8px' }}>
                        {renderStatusBadge(claim.status)}
                      </td>

                      {/* Action Arrow */}
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ArrowRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                      No recent claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: My Active Policies */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          border: '1px solid #ECEEF4',
          padding: '24px 26px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
              My Active Policies
            </h2>
            <Link
              to="/customer/policies"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#6C5DD3',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View All</span>
              <span style={{ fontSize: 14 }}>&rarr;</span>
            </Link>
          </div>

          {/* Policy Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data?.activePoliciesList && data.activePoliciesList.length > 0 ? (
              data.activePoliciesList.map((policy) => (
                <div
                  key={policy.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #ECEEF4',
                    borderRadius: 16,
                    padding: '16px 18px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  {/* Top Row: Icon, Title, Active Badge, More Options */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: getPolicyBoxBg(policy.policyType),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getPolicyIcon(policy.policyType)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
                          {policy.policyType}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {policy.policyNumber} &bull; Valid till {policy.endDate}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 9px',
                        borderRadius: 9999,
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                        ACTIVE
                      </span>
                      <MoreVertical size={16} color="#94A3B8" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Bottom Row: 3 Data Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #F3F4F8'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>
                        Sum Insured
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        ₹{policy.coverageAmount ? policy.coverageAmount.toLocaleString('en-IN') : '5,00,000'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>
                        Premium
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        {policy.premiumAmount
                          ? `₹${policy.premiumAmount.toLocaleString('en-IN')} / ${policy.premiumTerm || 'year'}`
                          : '₹12,500 / year'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>
                        Policy Type
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        {getDisplayPolicyType(policy)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                No active policies found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Breakpoints Style */}
      <style>{`
        @media (max-width: 1180px) {
          .cd-hero-row {
            grid-template-columns: 1fr !important;
          }
          .cd-tables-row {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 900px) {
          .cd-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .cd-metrics-grid {
            grid-template-columns: 1fr !important;
          }
          .cd-shield-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
