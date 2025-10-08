import { useState, FormEvent } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function LoginReg() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState('');

  const showAlertMessage = (message: string, type: string) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogin = async (event: FormEvent) => {
  event.preventDefault();
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: loginEmail, Password: loginPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      showAlertMessage('Login successful! Redirecting...', 'success');
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('token', data.token);
      setTimeout(() => {
        switch(data.user.role) {
          case 'Scheduler': 
            window.location.href = '/scheduling-committee';  // Changed from /scheduler-dashboard
            break;
          case 'LoadCommittee': 
            window.location.href = '/load-committee-dashboard'; 
            break;
          case 'Faculty': 
            window.location.href = '/faculty-dashboard'; 
            break;
          default: 
            window.location.href = '/student-dashboard'; 
            break;
        }
      }, 1500);
    } else {
      showAlertMessage(data.message || 'Login failed. Please check your credentials.', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlertMessage('Connection error. Please check if the backend server is running.', 'danger');
  }
};

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (registerPassword.length < 4) {
      showAlertMessage('Password must be at least 4 characters', 'danger');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          First_Name: firstName,
          Last_Name: lastName,
          Email: registerEmail,
          Password: registerPassword,
          role: role === 'Student' ? undefined : role,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showAlertMessage('Registration successful! Please login.', 'success');
        setFirstName('');
        setLastName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRole('');
        setTimeout(() => setActiveTab('login'), 2000);
      } else {
        showAlertMessage(data.message || 'Registration failed. Please try again.', 'danger');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlertMessage('Connection error. Please check if the backend server is running.', 'danger');
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <div className="row g-0">
          <div className="col-md-5 auth-left">
            <div>
              <i className="bi bi-calendar-check logo-icon"></i>
              <h2 className="fw-bold mb-3">SmartSchedule</h2>
              <p className="mb-0">Your intelligent academic scheduling solution</p>
            </div>
          </div>
          <div className="col-md-7 auth-right">
            <div className="auth-tabs d-flex justify-content-center">
              <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setAlert(null); }}>Login</button>
              <button className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setAlert(null); }}>Register</button>
            </div>
            {alert && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {alert.message}
                <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
              </div>
            )}
            {activeTab === 'login' && (
              <div>
                <h4 className="fw-bold mb-4">Welcome Back!</h4>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group password-wrapper">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input type={showLoginPassword ? 'text' : 'password'} className="form-control" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      <span className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}><i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i></span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3"><i className="bi bi-box-arrow-in-right me-2"></i>Login</button>
                  <div className="text-center"><small className="text-muted">Don't have an account? <button type="button" style={{border:'none',background:'none',color:'#0d6efd',cursor:'pointer',padding:0}} onClick={() => setActiveTab('register')}>Register here</button></small></div>
                </form>
              </div>
            )}
            {activeTab === 'register' && (
              <div>
                <h4 className="fw-bold mb-4">Create Account</h4>
                <form onSubmit={handleRegister}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-control" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-control" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" placeholder="Enter your email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group password-wrapper">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input type={showRegisterPassword ? 'text' : 'password'} className="form-control" placeholder="Create password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required minLength={4} />
                      <span className="password-toggle" onClick={() => setShowRegisterPassword(!showRegisterPassword)}><i className={`bi ${showRegisterPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i></span>
                    </div>
                    <small className="text-muted">Password must be at least 4 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                      <option value="">Select your role</option>
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty Member</option>
                      <option value="Scheduler">Scheduling Committee</option>
                      <option value="LoadCommittee">Load Committee</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3"><i className="bi bi-person-plus me-2"></i>Register</button>
                  <div className="text-center"><small className="text-muted">Already have an account? <button type="button" style={{border:'none',background:'none',color:'#0d6efd',cursor:'pointer',padding:0}} onClick={() => setActiveTab('login')}>Login here</button></small></div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginReg;