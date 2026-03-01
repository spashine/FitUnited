'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { WorkStream, Location } from '@/types';

const WORK_STREAMS: WorkStream[] = [
  'Catalyst',
  'Cloud',
  'Contact Center',
  'Data',
  'EYP',
  'Growth Protocol',
  'ITOPS',
  'OCE',
  'Pricing',
  'Risk',
  'SCO',
  'Tax',
  'TMO',
];

export default function Home() {
  const router = useRouter();
  const { currentUser, loginUser, registerUser, requestPasswordReset } = useAppContext();

  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workStream, setWorkStream] = useState<WorkStream>('Cloud');
  const [location, setLocation] = useState<Location>('US');

  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginUsername.trim()) return;

    const result = loginUser(loginUsername.trim(), loginPassword);
    if (!result.success) {
      setErrorMsg(result.message || 'Login failed.');
    } else {
      router.push('/dashboard');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setForgotSuccess('');
    setResetLink('');

    if (!forgotInput.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }

    const result = requestPasswordReset(forgotInput.trim());
    if (!result.success) {
      setErrorMsg(result.message || 'Failed to process request.');
    } else {
      setForgotSuccess(result.message || 'Reset link sent!');
      if (result.resetLink) {
        setResetLink(result.resetLink);
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email is required.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('Password is required.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    const result = registerUser({
      name: fullName.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      username: regUsername.trim(),
      password: regPassword,
      workStream,
      location,
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Registration failed.');
    } else {
      router.push('/dashboard');
    }
  };

  if (currentUser) {
    const tiles = [
      {
        href: '/dashboard',
        icon: (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'My Activity',
        desc: 'Log daily activities, track your points, and view your personal history.',
        accent: 'from-yellow-400 to-amber-500',
      },
      {
        href: '/teams',
        icon: (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        title: 'My Team',
        desc: 'View your team members, manage join requests, and see team performance.',
        accent: 'from-emerald-400 to-teal-500',
      },
      {
        href: '/leaderboard',
        icon: (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        title: 'Leaderboard',
        desc: 'See team scores, individual rankings, and weekly breakdowns.',
        accent: 'from-purple-400 to-indigo-500',
      },
      {
        href: '/all-teams',
        icon: (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        title: 'All Teams',
        desc: 'Browse all teams in the challenge and discover their team members.',
        accent: 'from-rose-400 to-pink-500',
      },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Hero Banner */}
        <div className="bg-ey-dark rounded-2xl overflow-hidden shadow-xl">
          <div className="h-1.5 bg-ey-yellow"></div>
          <div className="px-8 py-10 md:py-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Global Wellbeing Challenge
              </h1>
            </div>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
              Welcome back, <span className="text-ey-yellow font-semibold">{currentUser.name}</span>!
              Log activities, earn points, and compete with teams across regions.
            </p>
          </div>
        </div>

        {/* Navigation Tiles — 2×2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {tiles.map(tile => (
            <button
              key={tile.href}
              onClick={() => router.push(tile.href)}
              className="group text-left bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-1.5 bg-gradient-to-r ${tile.accent}`}></div>
              <div className="p-6 md:p-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tile.accent} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {tile.icon}
                </div>
                <h2 className="text-xl font-bold text-ey-dark mb-2">{tile.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{tile.desc}</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-ey-dark group-hover:text-ey-yellow-dark transition-colors">
                  <span>Open</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Login View ──────────────────────────────────────────────────────────

  if (isLoginView) {
    // ── Forgot Password Sub-view ────────────────
    if (showForgotPassword) {
      return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ey-yellow/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-ey-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ey-dark mb-2">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">
              Enter your email address or username and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {forgotSuccess && (
            <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-md text-emerald-700 text-sm font-medium">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{forgotSuccess}</span>
              </div>
              {resetLink && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    📧 Since this is a demo, here&apos;s your reset link:
                  </p>
                  <button
                    onClick={() => router.push(resetLink)}
                    className="w-full py-2 px-3 bg-ey-dark hover:bg-ey-darker text-ey-yellow text-sm font-semibold rounded-lg transition-colors"
                  >
                    Reset My Password →
                  </button>
                </div>
              )}
            </div>
          )}

          {!forgotSuccess && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ey-yellow outline-none"
                  placeholder="Enter your email or username"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-ey-dark hover:bg-ey-darker text-ey-yellow font-semibold rounded-lg shadow-md transition-transform active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setErrorMsg('');
                setForgotSuccess('');
                setResetLink('');
                setForgotInput('');
              }}
              className="font-semibold text-ey-dark hover:underline flex items-center gap-1 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    // ── Standard Login Form ────────────────
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-ey-dark mb-2">Welcome Back</h1>
          <p className="text-gray-500">Login to your account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ey-yellow outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => { setShowForgotPassword(true); setErrorMsg(''); }}
                className="text-xs font-semibold text-ey-dark hover:text-ey-darker hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ey-yellow outline-none"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-ey-dark hover:bg-ey-darker text-ey-yellow font-semibold rounded-lg shadow-md transition-transform active:scale-[0.98]"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {"Don't have an account? "}
          <button
            onClick={() => { setIsLoginView(false); setErrorMsg(''); }}
            className="font-semibold text-ey-dark hover:underline"
          >
            Sign up here
          </button>
        </div>
      </div>
    );
  }

  // ── Registration View ──────────────────────────────────────────────────

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ey-yellow outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ey-dark mb-2">Join the Challenge</h1>
        <p className="text-gray-500">Create your profile to get started</p>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Jane Doe"
          />
        </div>

        {/* Email & Contact Number — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Contact Number</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className={labelClass}>Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            className={inputClass}
            placeholder="e.g. jdoe"
          />
        </div>

        {/* Password & Confirm Password — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className={inputClass}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} ${confirmPassword && regPassword !== confirmPassword ? 'border-red-400 ring-1 ring-red-300' : ''}`}
              placeholder="Re-enter password"
            />
            {confirmPassword && regPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Workstream & Location — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Work Stream <span className="text-red-500">*</span></label>
            <select
              value={workStream}
              onChange={(e) => setWorkStream(e.target.value as WorkStream)}
              className={`${inputClass} bg-white`}
            >
              {WORK_STREAMS.map(ws => (
                <option key={ws} value={ws}>{ws}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Primary Location <span className="text-red-500">*</span></label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              className={`${inputClass} bg-white`}
            >
              <option value="US">United States</option>
              <option value="Mexico">Mexico</option>
              <option value="India">India</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-ey-dark hover:bg-ey-darker text-ey-yellow font-semibold rounded-lg shadow-md transition-transform active:scale-[0.98] mt-2"
        >
          Register Account
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        {"Already registered? "}
        <button
          onClick={() => { setIsLoginView(true); setErrorMsg(''); }}
          className="font-semibold text-ey-dark hover:underline"
        >
          Log in here
        </button>
      </div>
    </div>
  );
}
