import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import UserSubmissions from './UserSubmissions';
import { useToast } from '../common/AlertProvider';

const DocumentPreview = ({ title, url }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 h-full">
      <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">{title}</h4>
      {url ? (
        url.match(/\.(jpeg|jpg|gif|png)$/i) || !url.includes('.pdf') ? (
           <a href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl border border-slate-100 aspect-video bg-slate-50 flex items-center justify-center">
             <img src={url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                <span className="text-white font-bold text-xs bg-white/20 px-5 py-2 rounded-full backdrop-blur-md border border-white/30 shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  Inspect
                </span>
             </div>
           </a>
        ) : (
           <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 aspect-video rounded-2xl border border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all text-slate-900 group bg-slate-50/50">
             <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform">
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Document Object</span>
           </a>
        )
      ) : (
        <div className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-slate-100 text-slate-300 bg-slate-50/50">
          <svg width="24" height="24" className="mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Verification</span>
        </div>
      )}
    </div>
  );
};

const EditUser = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    full_name: '',
    new_password: '',
    allotted_exam_ids: [],
    aadhaar_front_url: '',
    aadhaar_back_url: '',
    pan_url: '',
    profile_photo_url: '',
  });
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
    fetchExams();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (data) {
      setEditUser({
        id: data.id,
        email: data.email || '',
        full_name: data.full_name || '',
        new_password: '',
        allotted_exam_ids: data.allotted_exam_ids || [],
        aadhaar_front_url: data.aadhaar_front_url || '',
        aadhaar_back_url: data.aadhaar_back_url || '',
        pan_url: data.pan_url || '',
        profile_photo_url: data.profile_photo_url || ''
      });
    } else if (error) {
      console.error('Error fetching user:', error);
      navigate('/admin/users');
    }
    setLoading(false);
  };

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('id, title').order('title');
    if (data) setExams(data);
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setEditUser({...editUser, new_password: pass});
  };

  const toggleExamSelection = (examId) => {
    const currentList = editUser.allotted_exam_ids || [];
    if (currentList.includes(examId)) {
      setEditUser({
        ...editUser, 
        allotted_exam_ids: currentList.filter(eId => eId !== examId)
      });
    } else {
      setEditUser({
        ...editUser, 
        allotted_exam_ids: [...currentList, examId]
      });
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('admin_update_candidate', {
        target_user_id: editUser.id,
        new_email: editUser.email,
        new_password: editUser.new_password || null,
        new_name: editUser.full_name,
        new_allotted_exam_ids: editUser.allotted_exam_ids || []
      });

      if (error) throw error;
      toast('Candidate profile synchronized successfully', 'success');
      navigate('/admin/users');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-slate-50/50">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin shadow-sm"></div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans bg-slate-50/50 selection:bg-slate-100">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation & Header */}
        <div className="mb-14 animate-fade-in">
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 group font-bold text-xs uppercase tracking-widest"
          >
            <svg className="transform group-hover:-translate-x-1 transition-transform" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Candidate Directory
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Profile Synchronization
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">Modify candidate identity and examination permissions</p>
        </div>

        <form onSubmit={handleSaveUser} className="space-y-16">
          {/* Main Controls Grid */}
          <div className="bg-white p-8 md:p-14 rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] space-y-10 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-2 text-slate-400">Communication Node (Email)</label>
                <input 
                  type="email" 
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all duration-300 text-sm font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-2 text-slate-400">Authorized Name</label>
                <input 
                  type="text" 
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all duration-300 text-sm font-medium"
                />
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-2 text-slate-400">
                Security Reset <span className="text-[9px] font-normal lowercase opacity-60 ml-1">(Leave blank to maintain current hash)</span>
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={editUser.new_password}
                  onChange={(e) => setEditUser({...editUser, new_password: e.target.value})}
                  placeholder="Set new access credentials..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-5 pr-24 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all duration-300 text-sm font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" onClick={generateRandomPassword} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-white transition-all active:scale-90" title="Generate Token">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-white transition-all">
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Verification Section */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.548 4.075 10.14 9.5 11.04a11.99 11.99 0 009.5-11.04c0-1.305-.21-2.56-.598-3.744A11.959 11.959 0 0112 2.714z"/></svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Identity Objects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <DocumentPreview title="Profile Photo" url={editUser.profile_photo_url} />
               <DocumentPreview title="Aadhaar Front" url={editUser.aadhaar_front_url} />
               <DocumentPreview title="Aadhaar Back" url={editUser.aadhaar_back_url} />
               <DocumentPreview title="PAN Card" url={editUser.pan_url} />
            </div>
          </div>

          {/* Exam Allocation Grid */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12h3.75M9 15h3.375m1.875-12h-9.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0014.25 3zM12 7.036c0 .72-.405 1.35-1 1.683-.595-.333-1-.963-1-1.683 0-1.104.895-2 2-2s2 .896 2 2z"/></svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Examination Privileges</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exams.map(exam => (
                <label 
                  key={exam.id} 
                  className={`relative group cursor-pointer bg-white p-6 rounded-3xl border transition-all duration-300 ${editUser.allotted_exam_ids?.includes(exam.id) ? 'border-slate-900 shadow-xl shadow-slate-200 ring-4 ring-slate-900/5' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${editUser.allotted_exam_ids?.includes(exam.id) ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200 group-hover:border-slate-400'}`}>
                      {editUser.allotted_exam_ids?.includes(exam.id) && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={editUser.allotted_exam_ids?.includes(exam.id)}
                      onChange={() => toggleExamSelection(exam.id)}
                      className="hidden"
                    />
                    <span className={`text-sm font-bold transition-colors ${editUser.allotted_exam_ids?.includes(exam.id) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {exam.title}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* User Submissions / Marks Release */}
          <div className="pt-16 border-t border-slate-100 animate-slide-up">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"/></svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Analytical Performance</h3>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <UserSubmissions userId={id} />
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="flex items-center justify-center pt-12 pb-24 animate-fade-in">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 px-20 rounded-[2rem] text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center gap-4"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Profile Synchronized</span>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5l-10.5 10.5-4.5-4.5" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;

