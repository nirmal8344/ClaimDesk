import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

export const Login: React.FC = () => {
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'LOGIN' or 'SIGNUP' (Customer only)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>(() => {
    return searchParams.get('mode') === 'signup' ? 'SIGNUP' : 'LOGIN';
  });

  // Login form state - EMPTY by default
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('claimdesk_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('claimdesk_remembered_email');
  });
  const [showPassword, setShowPassword] = useState(false);

  // Customer Sign-up form state - EMPTY by default
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'CLAIM_OFFICER') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const switchAuthMode = (mode: 'LOGIN' | 'SIGNUP') => {
    setAuthMode(mode);
    setError(null);
    if (mode === 'SIGNUP') {
      setSearchParams({ mode: 'signup' });
    } else {
      setSearchParams({});
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem('claimdesk_remembered_email', email.trim());
      } else {
        localStorage.removeItem('claimdesk_remembered_email');
      }

      const res = await login(email.trim(), password);

      // Role-based redirection from authenticated response
      if (res.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.role === 'CLAIM_OFFICER') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined
      });
      navigate('/customer/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="claimdesk-login-wrapper">
      {/* 56% Left Branded Panel matching reference image */}
      <div className="claimdesk-left-panel">
        <div className="left-hero-bg" />
        <div className="left-hero-overlay" />

        {/* Top: Logo with transparent background and no box/bar/border */}
        <div className="left-header-area">
          <img
            src="/brand/claimdesk-logo-white.png"
            alt="ClaimDesk"
            className="left-brand-logo"
          />
        </div>

        {/* Center: Headline and Tagline matching exact reference typography */}
        <div className="left-content-area">
          <h1 className="left-headline">
            Smart Claims<br />
            <span className="left-headline-lavender">Management.</span>
          </h1>
          <p className="left-tagline">
            Track. Submit. Manage. All in one place.
          </p>
        </div>

        {/* Bottom spacer for the car image composition */}
        <div className="left-bottom-spacer" />
      </div>

      {/* 44% Right Form Area */}
      <div className="claimdesk-right-panel">
        <div className="login-card-container">
          {/* Centered Logo on Card */}
          <div className="card-logo-wrap">
            <img
              src="/brand/claimdesk-logo.png"
              alt="ClaimDesk"
              className="card-brand-logo"
            />
          </div>

          {/* Card Heading */}
          <div className="card-headings">
            <h2 className="card-title">
              {authMode === 'LOGIN' ? 'Sign In' : 'Create Customer Account'}
            </h2>
            <p className="card-subtitle">
              {authMode === 'LOGIN'
                ? 'Enter your credentials to access your account'
                : 'Register as a customer to submit and manage your claims'}
            </p>
          </div>

          {/* Validation/Auth Error Banner */}
          {error && (
            <div className="card-error-alert" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          {authMode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form-fields">
              <div className="input-group">
                <label className="input-label" htmlFor="login-email">
                  Email address
                </label>
                <div className="input-field-wrap">
                  <Mail size={16} className="field-icon-left" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="field-text-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="login-password">
                  Password
                </label>
                <div className="input-field-wrap">
                  <Lock size={16} className="field-icon-left" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="field-text-input"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="field-icon-right"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="meta-actions-row">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="native-checkbox"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="link-forgot-pwd"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-signin-dark"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="divider-row">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <div className="register-switch-wrap">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchAuthMode('SIGNUP')}
                  className="link-register-action"
                >
                  Register as Customer
                </button>
              </div>

              {/* Demo Credentials Quick-Fill */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>Demo:</span>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@company.com'); setPassword('Admin@123'); }}
                  style={{ background: 'none', border: 'none', color: '#6C5DD3', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' }}
                >
                  Admin
                </button>
                <span style={{ color: '#D1D5DB', fontSize: 11.5 }}>•</span>
                <button
                  type="button"
                  onClick={() => { setEmail('officer@company.com'); setPassword('Officer@123'); }}
                  style={{ background: 'none', border: 'none', color: '#6C5DD3', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' }}
                >
                  Officer
                </button>
                <span style={{ color: '#D1D5DB', fontSize: 11.5 }}>•</span>
                <button
                  type="button"
                  onClick={() => { setEmail('arun.kumar@example.com'); setPassword('Customer@123'); }}
                  style={{ background: 'none', border: 'none', color: '#6C5DD3', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' }}
                >
                  Customer
                </button>
              </div>
            </form>
          ) : (
            /* Customer Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="auth-form-fields">
              <div className="input-group">
                <label className="input-label" htmlFor="signup-name">
                  Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-field-wrap">
                  <User size={16} className="field-icon-left" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="field-text-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-email">
                  Email address <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-field-wrap">
                  <Mail size={16} className="field-icon-left" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="field-text-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="signup-password">
                  Password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-field-wrap">
                  <Lock size={16} className="field-icon-left" />
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="field-text-input"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="field-icon-right"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="signup-dual-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="signup-phone">
                    Phone Number
                  </label>
                  <div className="input-field-wrap">
                    <Phone size={16} className="field-icon-left" />
                    <input
                      id="signup-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="field-text-input"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="signup-address">
                    Address
                  </label>
                  <div className="input-field-wrap">
                    <MapPin size={16} className="field-icon-left" />
                    <input
                      id="signup-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, State"
                      className="field-text-input"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-signin-dark"
                style={{ marginTop: 2 }}
              >
                {submitting ? 'Creating Account...' : 'Create Customer Account'}
              </button>

              <div className="divider-row">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <div className="register-switch-wrap">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchAuthMode('LOGIN')}
                  className="link-register-action"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="forgot-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="forgot-modal-header">
              <div className="forgot-modal-icon">
                <HelpCircle size={22} color="#6C5DD3" />
              </div>
              <button
                type="button"
                className="forgot-modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <h3 className="forgot-modal-title">Password Reset Assistance</h3>
            <p className="forgot-modal-desc">
              For security reasons, password resets are processed by system administration. Please contact support:
            </p>
            <div className="forgot-modal-email">
              support@claimdesk.internal
            </div>
            <p className="forgot-modal-subnote">
              Include your registered name and account email. An administrator will verify your credentials and issue a temporary login key.
            </p>
            <button
              type="button"
              className="forgot-modal-btn"
              onClick={() => setShowForgotModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Visual Design CSS Matching the Reference Image */}
      <style>{`
        .claimdesk-login-wrapper {
          display: flex;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: #F8F9FD;
          font-family: var(--font-primary, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          box-sizing: border-box;
        }

        /* 56% Left Branded Panel */
        .claimdesk-left-panel {
          flex: 0 0 56%;
          width: 56%;
          height: 100vh;
          position: relative;
          background: #11131F;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: clamp(32px, 5vh, 48px) clamp(36px, 5vw, 56px);
          box-sizing: border-box;
        }

        .left-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/assets/car_hero.jpg');
          background-size: cover;
          background-position: center bottom;
          opacity: 0.85;
          transform: scale(1.01);
        }

        .left-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(16, 18, 28, 0.72) 0%, rgba(16, 18, 28, 0.35) 45%, rgba(16, 18, 28, 0.76) 100%),
                      linear-gradient(90deg, rgba(16, 18, 28, 0.55) 0%, rgba(16, 18, 28, 0.15) 60%, rgba(16, 18, 28, 0.45) 100%);
          pointer-events: none;
        }

        .left-header-area {
          position: relative;
          z-index: 10;
        }

        .left-brand-logo {
          height: clamp(44px, 5.8vh, 52px);
          width: auto;
          max-width: 260px;
          object-fit: contain;
          display: block;
        }

        .left-content-area {
          position: relative;
          z-index: 10;
          max-width: 580px;
          margin-top: auto;
          margin-bottom: clamp(130px, 22vh, 200px);
        }

        .left-headline {
          font-size: clamp(40px, 4.5vw, 56px);
          font-weight: 800;
          line-height: 1.12;
          color: #FFFFFF;
          letter-spacing: -0.025em;
          margin: 0 0 16px 0;
        }

        .left-headline-lavender {
          color: #C4B5FD;
        }

        .left-tagline {
          font-size: clamp(15px, 1.4vw, 17px);
          color: #E2E8F0;
          line-height: 1.55;
          margin: 0;
          font-weight: 400;
        }

        .left-bottom-spacer {
          position: relative;
          z-index: 10;
          height: 1px;
        }

        /* 44% Right Login Card Area */
        .claimdesk-right-panel {
          flex: 0 0 44%;
          width: 44%;
          height: 100vh;
          background: #F8F9FD;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 3vh, 32px);
          box-sizing: border-box;
          overflow-y: auto;
        }

        .login-card-container {
          width: 100%;
          max-width: 448px;
          background: #FFFFFF;
          border-radius: 24px;
          padding: clamp(28px, 4vh, 40px) clamp(28px, 3.8vw, 40px);
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
          border: 1px solid #ECEEF3;
          box-sizing: border-box;
          margin: auto;
        }

        .card-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;
          margin-bottom: clamp(14px, 2.2vh, 20px);
        }

        .card-brand-logo {
          height: clamp(38px, 4.8vh, 44px);
          width: auto;
          max-width: 210px;
          object-fit: contain;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .card-headings {
          text-align: center;
          margin-bottom: clamp(16px, 2.4vh, 22px);
        }

        .card-title {
          font-size: clamp(22px, 3vh, 25px);
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
          margin: 0 0 6px 0;
        }

        .card-subtitle {
          font-size: 13.5px;
          color: #6B7280;
          margin: 0;
          line-height: 1.4;
        }

        .card-error-alert {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FEE2E2;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-form-fields {
          display: flex;
          flex-direction: column;
        }

        .input-group {
          margin-bottom: clamp(10px, 1.8vh, 14px);
        }

        .input-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 6px;
        }

        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon-left {
          position: absolute;
          left: 13px;
          color: #94A3B8;
          pointer-events: none;
        }

        .field-icon-right {
          position: absolute;
          right: 11px;
          background: transparent;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .field-icon-right:hover {
          color: #475569;
        }

        .field-text-input {
          width: 100%;
          height: 42px;
          padding: 10px 14px 10px 38px;
          font-size: 13.5px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          background: #FFFFFF;
          color: #111827;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .field-text-input::placeholder {
          color: #94A3B8;
          font-size: 13px;
        }

        .field-text-input:focus {
          border-color: #6C5DD3;
          box-shadow: 0 0 0 3px rgba(108, 93, 211, 0.12);
        }

        .meta-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          margin-bottom: clamp(12px, 2vh, 18px);
          font-size: 12.5px;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #64748B;
          cursor: pointer;
          user-select: none;
        }

        .native-checkbox {
          accent-color: #6C5DD3;
          width: 15px;
          height: 15px;
          border-radius: 4px;
          cursor: pointer;
        }

        .link-forgot-pwd {
          background: transparent;
          border: none;
          color: #6C5DD3;
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          padding: 0;
        }

        .link-forgot-pwd:hover {
          text-decoration: underline;
        }

        .btn-signin-dark {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          background: #131522;
          color: #FFFFFF;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.05s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-signin-dark:hover:not(:disabled) {
          background: #23263B;
        }

        .btn-signin-dark:active:not(:disabled) {
          transform: scale(0.99);
        }

        .btn-signin-dark:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: clamp(12px, 2vh, 18px) 0 clamp(10px, 1.8vh, 16px) 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }

        .divider-text {
          font-size: 12px;
          color: #94A3B8;
        }

        .register-switch-wrap {
          text-align: center;
          font-size: 13px;
          color: #64748B;
        }

        .link-register-action {
          background: transparent;
          border: none;
          color: #6C5DD3;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
        }

        .link-register-action:hover {
          text-decoration: underline;
        }

        .signup-dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        /* Modal Styles */
        .forgot-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 17, 26, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }

        .forgot-modal-card {
          width: 100%;
          max-width: 400px;
          background: #FFFFFF;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .forgot-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .forgot-modal-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #EDE9FE;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .forgot-modal-close {
          background: transparent;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .forgot-modal-close:hover {
          color: #1E293B;
        }

        .forgot-modal-title {
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .forgot-modal-desc {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .forgot-modal-email {
          background: #F1F5F9;
          border: 1px dashed #CBD5E1;
          padding: 9px 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          color: #6C5DD3;
          font-weight: 600;
          text-align: center;
          margin-bottom: 12px;
        }

        .forgot-modal-subnote {
          font-size: 12px;
          color: #64748B;
          line-height: 1.45;
          margin: 0 0 18px 0;
        }

        .forgot-modal-btn {
          width: 100%;
          padding: 10px;
          background: #6C5DD3;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 13.5px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
        }

        .forgot-modal-btn:hover {
          background: #5B4EC2;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .claimdesk-left-panel {
            display: none !important;
          }
          .claimdesk-right-panel {
            flex: 1 1 100%;
            width: 100vw;
            height: 100vh;
            padding: 16px;
          }
          .login-card-container {
            max-width: 440px;
            padding: 24px 20px;
          }
          .signup-dual-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        @media (max-height: 680px) {
          .login-card-container {
            padding: 20px 24px;
          }
          .card-logo-wrap {
            margin-bottom: 8px;
          }
          .card-headings {
            margin-bottom: 12px;
          }
          .input-group {
            margin-bottom: 8px;
          }
          .meta-actions-row {
            margin-bottom: 10px;
          }
          .divider-row {
            margin: 10px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
