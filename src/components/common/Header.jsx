import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isAdmin, isCandidate, onLogout, isExamActive, onSubmitExam }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  
  const navLinkClass = (path) => `
    relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300
    ${location.pathname === path 
      ? 'bg-zinc-900/5 text-[color:var(--text-dark)]' 
      : 'text-[color:var(--text-light)] hover:text-[color:var(--text-dark)] hover:bg-zinc-900/5'}
  `;

  return (
    <div className="w-full flex justify-center pt-6 pb-2 px-4 sticky top-0 z-[1000]">
      <header className="px-6 md:px-8 h-16 flex items-center backdrop-blur-md border shadow-2xl rounded-full w-full max-w-5xl transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center justify-between w-full">
          {/* Left Section: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center bg-white/95 rounded-xl px-4 py-1.5 shadow-md hover:scale-[1.03] transition-all duration-300">
              <img src="/logo_full.png" alt="isuccessnode" className="h-7 object-contain" />
            </Link>
          </div>

          {/* Center Section: Navigation (Hidden during exam) */}
          <nav className="flex-2 flex justify-center items-center gap-2 md:gap-4">
            {!isExamActive && isAdminRoute && (
              <>
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  Users
                </Link>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Exams
                </Link>
              </>
            )}

            {!isExamActive && isCandidate && !isAdminRoute && (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  My Exams
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')}>
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Right Section: Actions */}
          <div className="flex-1 flex justify-end gap-4 md:gap-6 items-center">
            {isExamActive ? (
              <button 
                onClick={onSubmitExam} 
                className="bg-[#09090b] text-white font-black py-2.5 px-8 rounded-xl text-xs shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 flex items-center gap-2 tracking-[0.2em] uppercase"
              >
                Sync Data
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </button>
            ) : (isAdmin || isCandidate) ? (
              <button 
                onClick={() => { onLogout(); navigate('/'); }} 
                className="bg-zinc-100 text-[#09090b] font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-zinc-200 transition-all duration-300 shadow-sm border border-zinc-200"
              >
                Disconnect
              </button>
            ) : (
              <div className="flex gap-4 items-center">
                <Link to="/login" className="text-zinc-500 hover:text-[#09090b] font-bold text-[10px] uppercase tracking-widest transition-colors">Portal Access</Link>
                <Link to="/admin/login" className="bg-[#09090b] text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all">Admin Console</Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
