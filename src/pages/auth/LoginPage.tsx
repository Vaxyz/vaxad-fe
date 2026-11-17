import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../features/auth/authApi';
import { useAppDispatch } from '../../app/hooks';
import { loginSuccess } from '../../features/auth/authSlice';
import './login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [username, setUsername] = useState('ada.student');
  const [password, setPassword] = useState('@Vax1234.com');

  //   const [username, setUsername] = useState('admin');
  // const [password, setPassword] = useState('@Vax1234.com');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const result = await login({ username, password }).unwrap();
      dispatch(loginSuccess(result));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.data?.message ?? 'Unable to sign in. Confirm that the Vaxad backend is running.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">V</div>
        <p className="eyebrow">VAXAD SCHOOL PLATFORM</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to manage your school.</p>
        <Link className="login-home-link" to="/">← Back to school home</Link>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit} className="login-form">
          <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Signing in…' : 'Sign in'}</button>
        </form>
       
    <p className="dev-hint">
       {/* Development account: admin / @Vax1234.com */}
       </p>  
      </section>
    </main>
  );
}
