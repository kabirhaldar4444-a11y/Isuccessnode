import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import DisclaimerOverlay from '../DisclaimerOverlay';

const CandidateDashboard = ({ exams, onStartExam, profile, user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.id) {
      fetchSubmissions();

      const subSubscription = supabase
        .channel('submission-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'submissions',
          filter: `user_id=eq.${profile.id}`
        }, () => {
          fetchSubmissions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subSubscription);
      };
    }
  }, [profile?.id]);

  const fetchSubmissions = async () => {
    setLoadingResults(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*, exams(title)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (data) setSubmissions(data);
    setLoadingResults(false);
  };

  const completedExamIds = submissions.map(s => s.exam_id);
  const allottedExamIds = profile?.allotted_exam_ids || [];
  const availableExams = exams.filter(e => 
    allottedExamIds.includes(e.id) && !completedExamIds.includes(e.id)
  );
  const filteredExams = availableExams.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
    <DisclaimerOverlay user={user} profile={profile} />
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans selection:bg-slate-200">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 pb-12 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-slate-900 rounded-full" />
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
            </div>
            <p className="text-slate-400 font-bold text-lg uppercase tracking-widest ml-5">
              Welcome back, <span className="text-slate-900">{profile?.full_name || 'Candidate'}</span>
            </p>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 rounded-[2rem] flex items-center gap-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account Status</span>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-[0.15em]">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Exams Section */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Exams</h2>
              {searchQuery && filteredExams.length > 0 && (
                <span className="px-4 py-1.5 text-[10px] font-bold rounded-full bg-slate-900 text-white uppercase tracking-widest">
                  {filteredExams.length} Found
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-slate-900 shadow-sm focus:bg-white focus:ring-[6px] focus:ring-slate-900/5 focus:border-slate-200 transition-all outline-none placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredExams.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[4rem] animate-fade-in">
                <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                  <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <p className="text-slate-900 font-bold text-xl mb-2">{searchQuery ? `No matches for "${searchQuery}"` : 'No exams available'}</p>
                <p className="text-slate-400 font-medium text-sm">Exams will appear here once they are assigned to you.</p>
              </div>
            ) : (
              filteredExams.map((exam, i) => (
                <div 
                  key={exam.id} 
                  className={`relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] flex flex-col h-full transition-all duration-700 group animate-slide-up ${profile?.is_exam_locked ? 'opacity-70 grayscale pointer-events-none' : 'hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] hover:-translate-y-3'}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-16 h-16 rounded-[1.75rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </div>
                      {profile?.is_exam_locked && (
                        <div className="px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest">Locked</div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-slate-700 transition-colors">{exam.title}</h3>
                    
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-10 bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                      <svg className="text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-widest">{exam.duration} Minutes</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => !profile?.is_exam_locked && onStartExam(exam)} 
                    disabled={profile?.is_exam_locked}
                    className={`w-full py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl ${
                      profile?.is_exam_locked 
                        ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' 
                        : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 active:scale-95'
                    }`}
                  >
                    {profile?.is_exam_locked ? 'Access Restricted' : (
                      <>
                        Start Exam
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Exam History Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Exam History</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loadingResults ? (
              <div className="col-span-full py-24 flex justify-center">
                <div className="w-12 h-12 border-[6px] border-slate-100 border-t-slate-900 rounded-full animate-spin shadow-inner"></div>
              </div>
            ) : submissions.length === 0 ? (
               <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50/50 border border-slate-100 rounded-[3rem] animate-fade-in">
                 <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">No previous records found</p>
               </div>
            ) : (
              submissions.map((sub, i) => (
                <div 
                  key={sub.id} 
                  className={`bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-500 animate-slide-up hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group`}
                  style={{ animationDelay: `${(i % 10) * 100}ms` }}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${sub.is_released ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors">{sub.exams?.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(sub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-slate-50 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Status</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${sub.is_released ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sub.is_released ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                        {sub.is_released ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                    
                    {sub.is_released && (
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Score</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                          {sub.admin_score_override !== null ? sub.admin_score_override : sub.score}
                          <span className="text-xs font-bold text-slate-300 ml-1">/ {sub.total_questions * 5}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default CandidateDashboard;
