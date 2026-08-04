import React, { useState } from 'react';
import { Hexagon, LogIn } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const body = isRegister 
        ? { email, password, full_name: fullName, role: 'User' }
        : { email, password };

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated gradient background layers */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <div className="login-window helios-card animate-fade-in">
        <div className="login-branding">
          <div className="branding-content">
            <Hexagon className="icon" size={64} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>NexusDB</h1>
            <p>Experience the next generation of database management with AI-driven insights and ultra-fast performance.</p>
          </div>
          <div className="branding-graphic">
            <div className="graphic-circle c1"></div>
            <div className="graphic-circle c2"></div>
            <div className="graphic-circle c3"></div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isRegister ? 'Create Account' : 'Welcome Back'} <span className="waving-hand">👋</span>
              </h2>
              <p>{isRegister ? 'Please fill in the details to sign up.' : 'Please enter your details to sign in.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', borderRadius: '4px' }}>{error}</div>}
              
              {isRegister && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="John Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="user@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {!isRegister && (
                <div className="form-actions">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember for 30 days</span>
                  </label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
                ) : (
                  <>
                    <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }} 
                  style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                >
                  {isRegister ? 'Sign In' : 'Register Now'}
                </a>
              </div>
            </form>
          </div>
          
          <div className="login-animation-container">
            <DotLottieReact
              src="https://lottie.host/e6760eb9-f901-4282-a06c-b6d9efbf7d15/CbLKKzgmN8.lottie"
              loop
              autoplay
              className="lottie-graphic"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
