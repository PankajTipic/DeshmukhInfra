

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilArrowThickFromTop } from '@coreui/icons';
import { post } from '../../../util/api';
import { isLogIn, storeUserData } from '../../../util/session';
import { APP_VERSION } from "../../../version";
import { useToast } from '../../common/toast/ToastContext';

const Login = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();
  const userNameRef = useRef();
  const { showToast } = useToast();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [inputValue, setInputValue] = useState('');
  const otpRefs = useRef([]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isLogIn()) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }
    setInputValue(value);
  };

  const onInstall = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.deferredPrompt = null;
        setShowInstall(false);
      }
    }
  };

  async function sendOtp(email) {
    setSendingOtp(true);
    try {
      const respOtp = await post("/api/send", { email });
      if (respOtp?.ttl_minutes) {
        setAlertType('success');
        setAlertMessage(`OTP sent successfully to ${email}. Valid for ${respOtp.ttl_minutes} minutes.`);
        setOtpSent(true);
        setCountdown(respOtp.ttl_minutes * 60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setAlertType('danger');
        setAlertMessage('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setAlertType('danger');
      setAlertMessage('Error sending OTP. Please check your email and try again.');
    } finally {
      setSendingOtp(false);
    }
  }

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setAlertMessage('');
    setAlertType('');

    const emailValue = userNameRef.current?.value;
    if (!emailValue) {
      setAlertType('danger');
      setAlertMessage('Please enter your email or mobile number');
      return;
    }

    setEmail(emailValue);
    await sendOtp(emailValue);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlertMessage('');
    setAlertType('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setAlertType('danger');
      setAlertMessage('Please enter complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const resp = await post("/api/verify", { email, code: otpCode });

      if (resp?.token && resp?.user) {
        storeUserData(resp);
        showToast('success', 'Login Successful!');

        if (resp.user.type === 1) {
          navigate('/dashboard');
        } else if (resp.user.type === 2) {
          navigate('/worklog');
        }
        else if (resp.user.type === 3) {
          navigate('/worklog'); 
        }
         else if (resp.user.type === 4) {
          navigate('/displayPurchesVendors');
        }
          else if (resp.user.type === 5) {
          navigate('/worklog');
        }
        else {
          navigate('/');
        }
      } else {
        setAlertType('danger');
        setAlertMessage('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      setAlertType('danger');
      setAlertMessage('Invalid OTP or server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setAlertMessage('');
    setAlertType('');
    await sendOtp(email);
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setAlertMessage('');
    setAlertType('');
    setCountdown(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-row align-items-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Enhanced animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 25s infinite ease-in-out',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s infinite ease-in-out reverse',
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 30s infinite ease-in-out',
        filter: 'blur(70px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 22s infinite ease-in-out reverse',
        filter: 'blur(55px)'
      }} />

      {/* Particle effect overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <CContainer fluid className="px-3 px-sm-4" style={{ position: 'relative', zIndex: 10 }}>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={11} md={9} lg={7} xl={5} xxl={4}>
            <CCard 
              className="shadow-lg border-0"
              style={{
                borderRadius: '32px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <CCardBody className="p-4 p-sm-5">
                {/* Logo/Icon with enhanced styling */}
                <div className="text-center mb-3">
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                      animation: 'shine 3s infinite'
                    }} />
                    <span style={{ fontSize: '40px', position: 'relative', zIndex: 1 }}>🔐</span>
                  </div>
                  <h2 
                    style={{
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: 'clamp(24px, 5vw, 32px)',
                      marginBottom: '8px',
                      textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Welcome Back
                  </h2>
                  <p 
                    style={{
                      fontSize: 'clamp(13px, 3vw, 15px)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginBottom: 0,
                      fontWeight: '500',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {!otpSent ? 'Sign in to access your account' : 'Check your inbox for the code'}
                  </p>
                </div>

                {/* Enhanced Alert Message */}
                {alertMessage && (
                  <div 
                    style={{
                      padding: '14px 18px',
                      borderRadius: '16px',
                      marginBottom: '20px',
                      background: alertType === 'success' 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)' 
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: `1.5px solid ${alertType === 'success' 
                        ? 'rgba(34, 197, 94, 0.4)' 
                        : 'rgba(239, 68, 68, 0.4)'}`,
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: alertType === 'success'
                        ? '0 8px 24px rgba(34, 197, 94, 0.2)'
                        : '0 8px 24px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {alertType === 'success' ? '✅' : '❌'}
                    </span>
                    <span>{alertMessage}</span>
                  </div>
                )}

                <CForm onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                  {/* Enhanced Email Input */}
                  <div className="mb-3">
                    <label 
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.3px'
                      }}
                    >
                      Email or Mobile Number
                    </label>
                    <CInputGroup 
                      style={{
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(15px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                      }}
                      className="glass-input-group"
                    >
                      <CInputGroupText
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '14px 16px'
                        }}
                      >
                        <CIcon icon={cilUser} style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '20px' }} />
                      </CInputGroupText>
                      <CFormInput
                        ref={userNameRef}
                        placeholder="Enter your email or mobile"
                        required
                        value={inputValue}
                        onChange={handleInputChange}
                        disabled={otpSent}
                        style={{
                          border: 'none',
                          padding: '14px 16px 14px 0',
                          fontSize: '15px',
                          background: 'transparent',
                          color: '#ffffff',
                          fontWeight: '600'
                        }}
                      />
                    </CInputGroup>
                  </div>

                  {/* Enhanced OTP Input Section */}
                  {otpSent && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label 
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.95)',
                            marginBottom: 0,
                            letterSpacing: '0.3px'
                          }}
                        >
                          Enter 6-Digit OTP
                        </label>
                        {countdown > 0 && (
                          <span style={{
                            fontSize: '12px',
                            color: '#ffffff',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                            padding: '5px 12px',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}>
                            ⏱️ {formatTime(countdown)}
                          </span>
                        )}
                      </div>
                      <div 
                        style={{ 
                          display: 'flex', 
                          gap: '10px',
                          justifyContent: 'center',
                          marginBottom: '16px'
                        }}
                      >
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            style={{
                              width: 'clamp(44px, 12vw, 54px)',
                              height: 'clamp(50px, 13vw, 58px)',
                              fontSize: 'clamp(20px, 5vw, 24px)',
                              fontWeight: '800',
                              textAlign: 'center',
                              borderRadius: '14px',
                              border: '2px solid rgba(255, 255, 255, 0.25)',
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                              backdropFilter: 'blur(15px)',
                              color: '#ffffff',
                              outline: 'none',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: digit 
                                ? '0 8px 32px rgba(139, 92, 246, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.15)' 
                                : '0 4px 16px rgba(0, 0, 0, 0.1)'
                            }}
                            className="otp-input"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="mb-3">
                    {!otpSent ? (
                      <button 
                        type="submit" 
                        disabled={sendingOtp}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)',
                          backdropFilter: 'blur(20px)',
                          padding: '16px',
                          fontSize: '15px',
                          fontWeight: '800',
                          borderRadius: '16px',
                          border: '1.5px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          cursor: sendingOtp ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        className="enhanced-button"
                      >
                        <span style={{ position: 'relative', zIndex: 2 }}>
                          {sendingOtp ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              📧 Send OTP
                            </>
                          )}
                        </span>
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={loading || otp.join('').length < 6}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(16, 185, 129, 0.5) 100%)',
                          backdropFilter: 'blur(20px)',
                          padding: '16px',
                          fontSize: '15px',
                          fontWeight: '800',
                          borderRadius: '16px',
                          border: '1.5px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          boxShadow: '0 12px 40px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          cursor: (loading || otp.join('').length < 6) ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          opacity: (loading || otp.join('').length < 6) ? 0.6 : 1
                        }}
                        className="enhanced-button"
                      >
                        <span style={{ position: 'relative', zIndex: 2 }}>
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              ✅ Verify & Login
                            </>
                          )}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Enhanced Additional Actions */}
                  {otpSent ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        onClick={handleChangeEmail}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: '10px 0',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.3px'
                        }}
                        className="text-button"
                      >
                        ← Change Email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || sendingOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: countdown > 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                          padding: '10px 0',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.3px'
                        }}
                        className="text-button"
                      >
                        🔄 Resend OTP
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      {/* <button
                        type="button"
                        onClick={() => navigate('/sendEmailForResetLink')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.3px'
                        }}
                        className="text-button"
                      >
                        🔒 Forgot Password?
                      </button> */}
                    </div>
                  )}
                </CForm>

                {/* Enhanced Footer */}
                <div 
                  className="text-center mt-3 pt-3"
                  style={{
                    borderTop: '1.5px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <p 
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: 0,
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}
                  >
                    🛡️ Secured Infrastructure Portal
                  </p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
      
      {/* Enhanced Install Button */}
     {showInstall && (
  <button
    onClick={onInstall}
    style={{
      position: 'fixed',
      top: '28px',
      right: '28px',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)', // green gradient
      border: '1.5px solid rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
      zIndex: 2000,
      transition: 'transform 0.2s ease-in-out' // only scaling animation
    }}
    className="install-button"
  >
    <CIcon icon={cilArrowThickFromTop} style={{ fontSize: '26px', color: '#ffffff' }} />
  </button>
)}


      {/* Enhanced Version Badge */}
      <div 
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          fontSize: '13px',
          color: '#ffffff',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '12px 20px',
          borderRadius: '22px',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          fontFamily: 'monospace',
          fontWeight: '800',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          letterSpacing: '1px'
        }}
      >
        v{APP_VERSION}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-30px) translateX(15px) rotate(3deg); 
          }
          66% { 
            transform: translateY(-15px) translateX(-15px) rotate(-3deg); 
          }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .glass-input-group:focus-within {
          background: rgba(255, 255, 255, 0.18) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.25), 0 0 0 4px rgba(139, 92, 246, 0.1) !important;
          transform: translateY(-2px);
        }

        .enhanced-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .enhanced-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .enhanced-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 50px rgba(139, 92, 246, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .enhanced-button:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        .otp-input:focus {
          border-color: rgba(139, 92, 246, 0.6) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
          transform: scale(1.08);
        }

        .text-button:hover:not(:disabled) {
          color: rgba(255, 255, 255, 1) !important;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          transform: translateX(2px);
        }

        .install-button:hover {
          transform: translateY(-4px) rotate(5deg) scale(1.1);
          box-shadow: 0 16px 50px rgba(139, 92, 246, 0.4) !important;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Smooth scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Enhanced mobile responsiveness */
        @media (max-width: 576px) {
          .min-vh-100 {
            padding: 20px 0;
          }
          
          .enhanced-button {
            padding: 16px !important;
            font-size: 15px !important;
          }

          .install-button {
            width: 56px !important;
            height: 56px !important;
            top: 20px !important;
            right: 20px !important;
          }
        }

        /* Add glass morphism effect on card */
        .shadow-lg {
          animation: none !important;
        }

        @keyframes cardFloat {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-8px); 
          }
        }

        /* Enhance spinner animation */
        .spinner-border {
          border-width: 3px;
          animation: spinner-border 0.6s linear infinite;
        }

        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }

        /* Add subtle pulse to alert messages */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        /* Glow effect for focused elements */
        input:focus, button:focus {
          outline: none;
        }

        /* Add shimmer to version badge */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
    </div>
  );
};

export default Login;