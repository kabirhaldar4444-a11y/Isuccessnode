import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import { useToast } from '../common/AlertProvider';

const ExamPortal = ({ exam, onFinish, submitSignal }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReEntry, setIsReEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);

  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
    // Save answers and index to localStorage
    if (exam?.id) {
      localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({
        answers,
        currentQuestionIndex,
        timeLeft
      }));
    }
  }, [answers, currentQuestionIndex, timeLeft, exam.id]);

  const [confirmedSignal, setConfirmedSignal] = useState(0);

  useEffect(() => {
    if (submitSignal > 0 && submitSignal !== confirmedSignal && !isSubmitted) {
      setShowConfirm(true);
      setConfirmedSignal(submitSignal);
    }
  }, [submitSignal]);

  useEffect(() => {
    // Load persisted state on mount
    const savedProgress = localStorage.getItem(`exam_progress_${exam.id}`);
    if (savedProgress) {
      const { answers: savedAnswers, currentQuestionIndex: savedIndex, timeLeft: savedTime } = JSON.parse(savedProgress);
      if (savedAnswers) setAnswers(savedAnswers);
      if (savedIndex !== undefined) setCurrentQuestionIndex(savedIndex);
      if (savedTime !== undefined) setTimeLeft(savedTime);
    }
    fetchQuestions();
  }, [exam.id]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Check if already submitted (Corrected column name: user_id)
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('exam_id', exam.id)
        .single();
      
      if (existingSub) {
        setIsSubmitted(true);
        setIsReEntry(true);
        setLoading(false);
        return;
      }

      // 2. Fetch questions if not submitted
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', exam.id);
      
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // No questions found in database
        setQuestions([]);
        if (error) {
          toast('Database access error: ' + error.message, 'error');
        }
      }
    } catch (err) {
      console.error('Error in ExamPortal init:', err);
      toast('Failed to load examination questions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      // Time is up! Automatic submission
      setTimeExpired(true);
      setShowConfirm(true);
      // Wait 3 seconds so the user can actually see the "Time's Up" modal before auto-submitting
      const autoSubmitTimer = setTimeout(() => {
        if (!isSubmitted) {
          setShowConfirm(false);
          handleSubmitWithAnswers(answersRef.current);
        }
      }, 3000);
      return () => clearTimeout(autoSubmitTimer);
    }
    if (isSubmitted || !hasAcceptedDeclaration) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, hasAcceptedDeclaration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIdx) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIdx });
  };

  const handleSubmitWithAnswers = async (currentAnswers) => {
    if (isSubmitted) return;
    
    // calculate score uses answers state, we need local calculation
    let score = 0;
    questions.forEach((q, idx) => {
      if (currentAnswers[idx] === q.correct_option) score += 5;
    });

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (user) {
      const { error } = await supabase.from('submissions').insert([{
        user_id: user.id,
        exam_id: exam.id,
        score: score,
        total_questions: questions.length,
        answers: currentAnswers,
        is_released: false
      }]);

      if (error) {
        toast('Error saving submission: ' + error.message, 'error');
        return;
      }
    }

    setIsSubmitted(true);
    localStorage.removeItem(`exam_progress_${exam.id}`);
    toast('Your exam has been submitted successfully!', 'success');
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const confirmAndSubmit = () => {
    setShowConfirm(false);
    handleSubmitWithAnswers(answersRef.current);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option) {
        score += 5;
      }
    });
    return score;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hasAcceptedDeclaration) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 md:p-12 animate-fade-in relative z-10 w-full overflow-y-auto font-sans">
        {/* Ambient background decoration */}
        <div className="relative w-full max-w-4xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2rem] border border-zinc-100 z-10 p-8 md:p-14 animate-slide-up">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-100 pb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xl">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.35a1 1 0 011.3 0l6.75 6.75a1 1 0 010 1.41l-6.75 6.75a1 1 0 01-1.3 0l-6.75-6.75a1 1 0 010-1.41l6.75-6.75z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-black leading-none uppercase">{exam.title}</h1>
                <p className="text-[9px] font-black text-zinc-400 tracking-[0.4em] uppercase mt-3">Node Admission Protocol</p>
              </div>
            </div>
            
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
              <div className="px-5 py-2 text-center border-r border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Duration</p>
                <p className="text-sm font-black text-slate-900">120 Minutes</p>
              </div>
              <div className="px-5 py-2 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Total Load</p>
                <p className="text-sm font-black text-slate-900">40 Questions</p>
              </div>
            </div>
          </div>

          {/* Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-black rounded-full"></span>
                <h3 className="text-sm font-black text-black uppercase tracking-[0.2em]">Deployment Rules</h3>
              </div>
              <div className="space-y-4 text-zinc-600 font-medium">
                {[
                  "Maintain synchronous connection for data integrity.",
                  "Automated commit occurs upon temporal expiration.",
                  "Inter-application switching is strictly monitored.",
                  "Native navigation protocols must be maintained."
                ].map((text, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-black font-black">/</span>
                    <p className="text-[14px] leading-relaxed italic">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-zinc-400 rounded-full"></span>
                <h3 className="text-sm font-black text-black uppercase tracking-[0.2em]">Efficiency Index</h3>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Precision Lock</span>
                  <span className="text-sm font-black text-black">+5 Units</span>
                </div>
                <div className="flex justify-between items-center bg-black p-4 rounded-xl shadow-lg group">
                  <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Correction Factor</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black tracking-widest uppercase">Null</span>
                </div>
              </div>
            </section>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3 italic mb-8">
            <span className="text-black">⚠️</span>
            <p className="text-[12px] font-bold text-zinc-600 leading-tight">Proctoring sequence is active. Any deviation from protocol will trigger immediate disqualification.</p>
          </div>

          {/* Candidate Oath & Acceptance */}
          <div className="bg-zinc-900 rounded-3xl p-8 md:p-12 border border-zinc-800 shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Integrity Declaration</h4>
                <p className="text-[14px] font-bold text-white leading-relaxed italic opacity-90">
                  "I solemnly declare that I have read and understood all instructions. I will complete this assessment independently and follow the highest standards of academic integrity during the session."
                </p>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex flex-col items-center gap-8">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={acceptedCheckbox}
                      onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 rounded-lg border-2 border-white/20 bg-transparent transition-all peer-checked:bg-white peer-checked:border-white group-hover:border-white flex items-center justify-center">
                      <svg className={`w-4 h-4 text-black transition-transform duration-300 ${acceptedCheckbox ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                    Acknowledge and synchronize
                  </span>
                </label>

                {/* Conditional Start Button with smooth entrance */}
                <div className={`w-full transition-all duration-700 transform ${acceptedCheckbox ? 'opacity-100 translate-y-0 scale-100 h-auto visible' : 'opacity-0 translate-y-8 scale-95 h-0 overflow-hidden invisible'}`}>
                  <button
                    onClick={() => setHasAcceptedDeclaration(true)}
                    className="w-full py-6 rounded-2xl font-black tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl bg-white text-black hover:bg-zinc-100 hover:scale-[1.01] active:scale-95 uppercase text-[11px]"
                  >
                    Initiate Session
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                  <p className="text-[8px] text-center text-white/40 font-black uppercase tracking-[0.4em] mt-6 ml-1">Temporal recording starts immediately</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Confirm Submit Modal ── */
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
      {/* Card */}
      <div className="relative glass-card-saas p-8 max-w-md w-full animate-slide-up border-t-4 border-t-amber-500 shadow-2xl text-center z-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        </div>
        <h3 className="text-2xl font-black mb-3 text-[color:var(--text-dark)]">Submit Exam?</h3>
        <p className="text-[color:var(--text-light)] text-sm leading-relaxed mb-2">
          You have answered <span className="font-bold text-primary-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
        </p>
        <p className="text-[color:var(--text-light)] text-sm mb-8">
          Once submitted, <span className="text-amber-500 font-bold">you cannot make any changes.</span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-3 px-6 rounded-xl font-bold border transition-all hover:bg-white/5 text-[color:var(--text-light)]"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            No, Continue
          </button>
          <button
            onClick={confirmAndSubmit}
            className="flex-1 py-3 px-6 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 animate-fade-in relative z-10 w-full">
        {/* Animated Background Ambience */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        
        <div className="glass-card-saas p-10 md:p-14 text-center max-w-xl w-full relative z-10 animate-slide-up border-t-4 border-t-emerald-500">
          <div className="w-24 h-24 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-500/5">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 text-[color:var(--text-dark)]">Exam Submitted!</h2>
          <p className="text-[color:var(--text-light)] text-base font-medium leading-relaxed mb-8">
            Your responses have been successfully recorded.<br/>
            <span className="text-primary-500 font-bold mt-2 inline-block">Results are currently locked</span> and will be available on your dashboard once approved.
          </p>
          
          {!isReEntry && (
            <div className="mb-8 p-5 rounded-2xl flex flex-col items-center gap-2 border bg-blue-500/5 border-blue-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/70">Time Taken</span>
              <span className="text-xl font-black text-blue-500/90">{formatTime(exam.duration * 60 - timeLeft)}</span>
            </div>
          )}
          
          <button onClick={onFinish} className="btn-premium w-full py-4 font-black tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] shadow-xl shadow-primary-500/20">
            Return to Dashboard
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 animate-fade-in relative z-10 w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="glass-card-saas p-10 md:p-14 text-center max-w-xl w-full relative z-10 animate-slide-up border-t-4 border-t-amber-500">
          <div className="w-20 h-20 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-8">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-dark)' }}>No Questions Available</h2>
          <p className="mb-8" style={{ color: 'var(--text-light)' }}>
            This exam has been scheduled but no questions have been added yet. Please contact the administrator.
          </p>
          <button onClick={onFinish} className="btn-premium w-full py-4">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {/* Confirm Submit Modal Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          {/* Card */}
        <div className="relative glass-card-saas p-8 max-w-md w-full animate-slide-up border-t-4 shadow-2xl text-center z-10" style={{ borderTopColor: timeExpired ? '#f59e0b' : '#10b981' }}>
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ring-8 ${timeExpired ? 'bg-amber-500/10 text-amber-500 ring-amber-500/5' : 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/5'}`}>
              {timeExpired ? (
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              )}
            </div>
            <h3 className="text-2xl font-black mb-3 text-[color:var(--text-dark)]">
              {timeExpired ? "⏱️ Time's Up!" : 'Submit Exam?'}
            </h3>
            <p className="text-[color:var(--text-light)] text-sm leading-relaxed mb-2">
              {timeExpired 
                ? 'Your exam time has ended. Your answers will be submitted now.'
                : <>You have answered <span className="font-bold text-primary-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.</>
              }
            </p>
            <p className="text-[color:var(--text-light)] text-sm mb-8">
              Once submitted, <span className="text-amber-500 font-bold">you cannot make any changes.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-6 rounded-xl font-bold border transition-all hover:bg-white/5 text-[color:var(--text-light)]"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                No, Continue
              </button>
              <button
                onClick={confirmAndSubmit}
                className="flex-1 py-3 px-6 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-portal w-full animate-fade-in relative z-10 pt-4 pb-12">
      {/* Immersive HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 bg-white dark:bg-black border border-zinc-100 dark:border-white/10 rounded-2xl sticky top-4 z-50 shadow-2xl shadow-black/5 dark:shadow-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Synchronizing Session</span>
          <h2 className="text-2xl font-black tracking-tighter text-black dark:text-white uppercase line-clamp-1">{exam.title}</h2>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Temporal Window</span>
            <div className={`text-2xl font-black flex items-center gap-3 ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-black dark:text-white'}`}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative">
        {/* Main Examination Area (Full Width) */}
        <div className="glass-card-saas p-8 md:p-10 flex flex-col min-h-[60vh] relative overflow-hidden transition-all duration-300">
          {/* Progress Indicator & Drawer Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b gap-4" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                title="Open Global Map"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                <span className="font-black text-[10px] hidden sm:block tracking-[0.2em] uppercase">Global Map</span>
              </button>
              
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                Node 
                <span className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center font-black">
                  {currentQuestionIndex + 1}
                </span>
                of {questions.length}
              </span>
            </div>
            
            <div className="w-full sm:w-48 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black dark:bg-white transition-all duration-700 ease-in-out shadow-[0_0_10px_white]" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex-1 animate-slide-up" key={currentQuestionIndex}>
            <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-10 text-[color:var(--text-dark)] break-words">
              {currentQuestion.question_text}
            </h3>
            
            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                return (
                  <label 
                    key={idx} 
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 group ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10' 
                        : 'hover:border-primary-500/50 hover:bg-white/5 border-transparent bg-[color:var(--input-bg)]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="option" 
                      value={idx} 
                      checked={isSelected}
                      onChange={() => handleOptionSelect(idx)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-400 group-hover:border-primary-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                    <span className={`text-lg font-medium transition-colors break-words ${isSelected ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-[color:var(--text-dark)]'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--glass-border)' }}>
            {/* Previous Button */}
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/20 w-full sm:w-auto justify-center"
              style={{ color: 'var(--text-light)' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>

            {/* Save & Next OR Submit Exam (last question) */}
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 font-black tracking-wide flex items-center gap-2 rounded-2xl w-full sm:w-auto justify-center transition-all duration-300 hover:scale-[1.03] active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Submit Exam
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)} 
                className="btn-premium px-10 py-4 font-black tracking-wide flex items-center gap-2 hover:scale-[1.02] shadow-xl shadow-primary-500/20 w-full sm:w-auto justify-center"
              >
                Save & Next
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Hidden Sidebar Drawer (Overlay) */}
        {/* Backdrop overlay */}
        <div 
          className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Sliding Drawer Container */}
        <div 
          className={`fixed top-0 right-0 h-screen w-full max-w-[350px] z-[9999] glass-card-saas !rounded-none !border-y-0 !border-r-0 border-l p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--card-bg)' }}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h4 className="text-xl font-black tracking-widest uppercase flex items-center gap-3 text-[color:var(--text-dark)]">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Question Map
            </h4>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-10 h-10 rounded-full hover:bg-rose-500/15 hover:text-rose-500 text-slate-400 transition-all flex items-center justify-center shrink-0"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = answers[idx] !== undefined;
                
                let stylingClass = "text-[color:var(--text-dark)] bg-black/5 dark:bg-white/5 border-transparent hover:bg-primary-500/20";
                
                if (isCurrent) {
                  stylingClass = "bg-primary-500 text-white shadow-lg shadow-primary-500/40 ring-2 ring-primary-500/20 ring-offset-1 ring-offset-[color:var(--card-bg)] scale-110 z-10";
                } else if (isAnswered) {
                  stylingClass = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-bold";
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsSidebarOpen(false); // Optionally close on select, but keeping it open might be better if they want to jump around quickly. Let's not close it automatically for better UX unless requested, wait, they said "On click -> sidebar should slide in smoothly...". If they want to jump questions rapidly, let's keep it open or just close it to view the question.
                    }}
                    className={`aspect-square w-full rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 border ${stylingClass}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex flex-col gap-3 shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--text-light)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></span>
                Answered
              </div>
              <span>{Math.max(0, Object.keys(answers).length)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--text-light)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-black/10 dark:bg-white/10"></span>
                Unanswered
              </div>
              <span>{Math.max(0, questions.length - Object.keys(answers).length)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExamPortal;

