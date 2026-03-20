import React, { useEffect, useRef, useState } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import DOTS from 'vanta/dist/vanta.dots.min';
import * as THREE from 'three';

const bgStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 1000,
  overflow: 'hidden',
};

const outerCenterStyle = {
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 1002,
  width: '100vw',
};

const greetingStyle = {
  fontFamily: 'Pacifico, Caveat, Poppins, cursive, Arial, sans-serif',
  fontWeight: 700,
  fontSize: '2.5rem',
  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1.5px',
  marginBottom: '10px',
  textAlign: 'center',
  pointerEvents: 'auto',
  textShadow: '0 2px 8px rgba(67, 206, 162, 0.15)',
};

const appNameStyle = {
  fontFamily: 'Montserrat, Arial, sans-serif',
  fontWeight: 900,
  fontSize: '3.2rem',
  color: '#2b7a78',
  marginBottom: '18px',
  letterSpacing: '1px',
  textShadow: '0 2px 8px rgba(43,122,120,0.08)',
  textAlign: 'center',
  pointerEvents: 'auto',
};

const subTextStyle = {
  color: '#444',
  fontSize: '1.05rem',
  marginBottom: '18px',
  fontFamily: 'Poppins, Arial, sans-serif',
  fontWeight: 400,
  textAlign: 'center',
};

const buttonStyle = {
  marginTop: '18px',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(66, 133, 244, 0.85)',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)',
  transition: 'background 0.2s',
  display: 'flex',
  alignItems: 'center',
};

function GoogleLogin() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [typedName, setTypedName] = useState('');
  const fullAppName = 'SympAI';
  const navigate = useNavigate();

  // Typewriter effect for app name
  useEffect(() => {
    let i = 0;
    setTypedName('');
    const interval = setInterval(() => {
      setTypedName((prev) => {
        if (i < fullAppName.length) {
          const next = prev + fullAppName[i];
          i++;
          return next;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = DOTS({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x6ec6ca, // soft teal dots
        color2: 0xffffff, // secondary color (white)
        backgroundColor: 0xe6fffa, // very light teal background
        size: 15.0, // much larger dot size for maximum visibility
        spacing: 100.0, // user custom spacing
      });
    }
    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          // Suppress Vanta.js DOM errors
        }
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      alert('Google sign-in failed. ' + (error && error.message ? error.message : ''));
    }
  };

  return (
    <>
      <div ref={vantaRef} style={bgStyle}></div>
      <div style={outerCenterStyle}>
        <div style={greetingStyle}>Welcome to</div>
        <div style={appNameStyle}>
          {typedName}
          <span style={{borderRight: '2px solid #2b7a78', marginLeft: 2, animation: 'blink 1s steps(1) infinite'}}></span>
        </div>
        <button style={buttonStyle} onClick={handleGoogleSignIn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: 24, marginRight: 12, verticalAlign: 'middle' }} />
          Sign in with Google
        </button>
      </div>
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default GoogleLogin; 