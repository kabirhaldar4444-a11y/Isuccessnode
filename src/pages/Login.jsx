import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useToast } from '../components/common/AlertProvider';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('info@isuccessnode.com');
  const [password, setPassword] = useState('qwerty@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailToAuth = email.trim().toLowerCase();
    const passwordToAuth = password;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: passwordToAuth
      });

      if (error) throw error;
      const user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, profile_completed, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error('Database access error. Account initialization incomplete.');
      }

      if (user.email === 'info@isuccessnode.com' || profile.role === 'admin') {
        await onLoginSuccess();
        toast('Access Granted: Administrator Session Initialized', 'success');
        navigate('/admin');
        return;
      }

      if (profile.role === 'candidate') {
        await onLoginSuccess();
        toast(`Welcome back, ${profile.full_name || 'Candidate'}`, 'success');
        navigate(profile.profile_completed ? '/' : '/complete-profile');
      } else {
        await supabase.auth.signOut();
        throw new Error('Access restricted. Please contact administrator.');
      }
    } catch (err) {
      toast(err.message === 'Invalid login credentials' ? 'Invalid credentials. Please verify your email and password.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans selection:bg-white/10">
      
      {/* ── MODERN TECH STEALTH BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        {/* Grayscale Micro-Orbs (High-Contrast Stealth) */}
        {[
          { color: 'bg-white', pos: 'top-[15%] left-[20%]', anim: 'animate-drift-right', dur: '65s', delay: '0s', blur: 'blur-[100px]', op: 'opacity-[0.03]' },
          { color: 'bg-zinc-500', pos: 'top-[40%] right-[30%]', anim: 'animate-drift-left', dur: '75s', delay: '-15s', blur: 'blur-[80px]', op: 'opacity-[0.05]' },
          { color: 'bg-white', pos: 'bottom-[20%] left-[10%]', anim: 'animate-drift-right', dur: '85s', delay: '-5s', blur: 'blur-[120px]', op: 'opacity-[0.02]' },
          { color: 'bg-zinc-700', pos: 'top-[60%] right-[15%]', anim: 'animate-drift-left', dur: '55s', delay: '-20s', blur: 'blur-[60px]', op: 'opacity-[0.04]' },
          { color: 'bg-white', pos: 'bottom-[40%] left-[70%]', anim: 'animate-drift-right', dur: '95s', delay: '-30s', blur: 'blur-[100px]', op: 'opacity-[0.03]' },
        ].map((orb, i) => (
          <div 
            key={i}
            className={`absolute ${orb.pos} w-[400px] h-[400px] ${orb.color} ${orb.op} rounded-full ${orb.blur} ${orb.anim}`}
            style={{ animationDelay: orb.delay, animationDuration: orb.dur }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[320px] px-4 animate-fade-in py-12">
        
        {/* ── LOGO SECTION ── */}
        <div className="flex flex-col items-center mb-14 transition-transform hover:scale-[1.02] duration-500">
          <div className="w-44 h-auto p-4 bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(255,255,255,0.1)] border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img src="/logo_full.png" alt="isuccessnode" className="w-full h-full object-contain relative z-10" />
          </div>
        </div>

        {/* ── AUTHENTICATION FORM ── */}
        <form onSubmit={handleLogin} className="flex flex-col gap-8">
          
          {/* Email Field */}
          <div className="group relative">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 ml-0.5 group-focus-within:text-white transition-colors">
              Authorized Identification
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-0 text-zinc-700 group-focus-within:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="id@isuccessnode.com"
                required
                className="w-full pl-8 pr-2 py-3 bg-transparent border-b border-zinc-800 focus:border-white focus:outline-none transition-all duration-500 font-medium text-zinc-200 placeholder:text-zinc-800 placeholder:italic"
                style={{ fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group relative">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 ml-0.5 group-focus-within:text-white transition-colors">
              Security Protocol
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-0 text-zinc-700 group-focus-within:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Protocol Key"
                required
                className="w-full pl-8 pr-12 py-3 bg-transparent border-b border-zinc-800 focus:border-white focus:outline-none transition-all duration-500 font-medium text-zinc-200 placeholder:text-zinc-800"
                style={{ fontFamily: 'Inter' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-zinc-600 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="group relative mt-4 w-full bg-white text-black font-black py-4 rounded-xl shadow-[0_10px_30px_-5px_rgba(255,255,255,0.3)] hover:bg-[#fafafa] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 overflow-hidden"
          >
            <span className={`flex items-center justify-center gap-2 tracking-[0.4em] uppercase text-[11px] ${loading ? 'opacity-0' : 'opacity-100'}`}>
              Establish Link
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </button>

          {/* Bottom Branding (High-Density Tech) */}
          <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-700">
              isuccessnode Global Network
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
