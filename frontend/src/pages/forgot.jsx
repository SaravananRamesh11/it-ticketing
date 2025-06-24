import React, { useState } from 'react';
import axios from 'axios';
import OtpTimer from './otptimer.jsx';
import './forgot.css'; // Make sure to import the CSS

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/vista/requestotp`, { email });
      setOtpSent(true);
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending OTP');
    }
  };

  const verifyOtpAndReset = async () => {
    if (otpExpired) return setMessage('OTP has expired. Please request a new one.');

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/vista/resetpassword`, {
        email,
        otp,
        newPassword
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <p>Please follow the steps to reset your password.</p>
        {message && <p className="message">{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-box"
            />
            <button className="submit-btn" onClick={handleRequestOtp}>Request OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <OtpTimer duration={300} onExpire={() => setOtpExpired(true)} />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-box"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-box"
            />
            <button className="submit-btn" onClick={verifyOtpAndReset} disabled={otpExpired}>
              Reset Password
            </button>
          </>
        )}

        {step === 3 && (
          <div className="success-msg">
            ✅ Password reset successfully. You can now log in with your new password.
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
