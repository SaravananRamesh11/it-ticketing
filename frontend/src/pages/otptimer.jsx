// components/OtpTimer.js
import React, { useEffect, useState } from 'react';

const OtpTimer = ({ duration = 300, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ fontWeight: 'bold', marginTop: 10 }}>
      OTP expires in: <span style={{ color: secondsLeft < 30 ? 'red' : 'green' }}>{formatTime(secondsLeft)}</span>
    </div>
  );
};

export default OtpTimer;
