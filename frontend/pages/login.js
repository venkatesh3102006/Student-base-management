import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@college.edu', password: 'admin123' });
    else setForm({ email: 'faculty@college.edu', password: 'faculty123' });
  };

  return (
    <>
      <Head>
        <title>Login — College Student Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {/* Left panel */}
        <div
          className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0a0f2e 0%, #1a2460 50%, #0f1740 100%)' }}
        >
          {/* Background orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                College Portal
              </span>
              <span className="block text-indigo-300 text-xs">Student Management System</span>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
              Student Records,<br />
              <span style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Simplified.
              </span>
            </h1>
            <p className="text-indigo-200 text-lg max-w-sm leading-relaxed mb-10">
              Manage academic records, track performance, and maintain disciplinary history — all in one secure portal.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Role-based Access', 'CGPA Tracking', 'Malpractice Records', 'Analytics Dashboard'].map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-indigo-200 border border-white/10">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative z-10 flex gap-6">
            {[['Students', '25+'], ['Departments', '6'], ['Faculty', '3+']].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{val}</p>
                <p className="text-indigo-300 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              </div>
              <span className="font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>College Portal</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Sign in</h2>
            <p className="text-gray-500 text-sm mb-7">Enter your credentials to access the portal</p>

            {/* Demo login buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => fillDemo('admin')}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                Fill Admin Demo
              </button>
              <button
                onClick={() => fillDemo('faculty')}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all"
              >
                Fill Faculty Demo
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="portal-label">Email Address</label>
                <input
                  type="email"
                  className="portal-input"
                  placeholder="admin@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="portal-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="portal-input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: loading ? '#6b7280' : 'linear-gradient(135deg, #1e2a5e, #2d3d8e)', fontFamily: 'Sora, sans-serif' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-8">
              Secured with JWT Authentication · College Portal v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
