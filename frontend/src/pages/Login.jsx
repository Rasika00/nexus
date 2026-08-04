import React, { useState } from 'react';
import { Hexagon, LogIn } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
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
                Welcome Back <span className="waving-hand">👋</span>
              </h2>
              <p>Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="admin@nexus.db" 
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

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
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
