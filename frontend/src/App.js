import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [view, setView] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [subs, setSubs] = useState([]);
  const [pnrForm, setPnrForm] = useState({ pnrNumber: '', passengerName: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePnrChange = e => setPnrForm({ ...pnrForm, [e.target.name]: e.target.value });

  const handleRegister = async e => {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Registration successful! Please check your email for verification link.');
      setView('login');
    } else {
      setMessage(data.message || (data.errors && data.errors[0]?.msg) || 'Registration failed');
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setMessage('Login successful!');
    } else {
      setMessage(data.message || (data.errors && data.errors[0]?.msg) || 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setMessage('Logged out.');
    setSubs([]);
  };

  // Fetch subscriptions after login
  useEffect(() => {
    if (token) fetchSubs();
    // eslint-disable-next-line
  }, [token]);

  const fetchSubs = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/pnr/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSubs(data);
      else setMessage(data.message || 'Failed to fetch subscriptions');
    } catch (e) {
      setMessage('Network error');
    }
    setLoading(false);
  };

  const handleAddPnr = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const res = await fetch(`${API_BASE}/pnr/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pnrForm),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('PNR subscribed!');
      setPnrForm({ pnrNumber: '', passengerName: '' });
      fetchSubs();
    } else {
      setMessage(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to subscribe');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    setMessage('');
    setLoading(true);
    const res = await fetch(`${API_BASE}/pnr/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Subscription deleted');
      fetchSubs();
    } else {
      setMessage(data.message || 'Failed to delete');
    }
    setLoading(false);
  };

  const handleRefreshStatus = async (pnr, idx) => {
    setMessage('');
    setLoading(true);
    const res = await fetch(`${API_BASE}/pnr/status/${pnr}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setSubs(subs => subs.map((sub, i) => i === idx ? { ...sub, currentStatus: data } : sub));
      setMessage('Status refreshed');
    } else {
      setMessage(data.message || 'Failed to refresh status');
    }
    setLoading(false);
  };

  if (token) {
    return (
      <div style={{ maxWidth: 500, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>Welcome to RailGo!</h2>
        <button onClick={handleLogout}>Logout</button>
        <h3>Your PNR Subscriptions</h3>
        {loading && <p>Loading...</p>}
        <form onSubmit={handleAddPnr} style={{ marginBottom: 20 }}>
          <input name="pnrNumber" placeholder="PNR Number" value={pnrForm.pnrNumber} onChange={handlePnrChange} required minLength={10} maxLength={10} />{' '}
          <input name="passengerName" placeholder="Passenger Name" value={pnrForm.passengerName} onChange={handlePnrChange} required />{' '}
          <button type="submit">Add PNR</button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subs.map((sub, idx) => (
            <li key={sub._id} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
              <strong>PNR:</strong> {sub.pnrNumber}<br />
              <strong>Passenger:</strong> {sub.passengerName}<br />
              <strong>Status:</strong> {sub.currentStatus?.status || 'N/A'}<br />
              <button onClick={() => handleRefreshStatus(sub.pnrNumber, idx)} disabled={loading}>Refresh Status</button>{' '}
              <button onClick={() => handleDelete(sub._id)} disabled={loading}>Delete</button>
            </li>
          ))}
        </ul>
        {message && <p style={{ color: message.includes('fail') ? 'red' : 'green' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>RailGo {view === 'register' ? 'Registration' : 'Login'}</h2>
      {view === 'register' ? (
        <form onSubmit={handleRegister}>
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required /><br />
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required /><br />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
          <button type="submit">Register</button>
          <p>Already have an account? <button type="button" onClick={() => setView('login')}>Login</button></p>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
          <button type="submit">Login</button>
          <p>Don&apos;t have an account? <button type="button" onClick={() => setView('register')}>Register</button></p>
        </form>
      )}
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default App; 