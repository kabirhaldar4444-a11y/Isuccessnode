import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import DisclaimerOverlay from '../../components/DisclaimerOverlay';
import SignaturePad from '../../components/common/SignaturePad';

const INDIA_STATES_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Rajahmundry","Tirupati","Kakinada","Kadapa","Anantapur"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tawang","Ziro","Bomdila","Roing","Tezu","Aalo","Khonsa"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon","Dhubri","Diphu"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga","Arrah","Begusarai","Chhapra","Katihar","Munger"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur","Ambikapur","Raigarh","Chirmiri"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Sanquelim","Canacona","Pernem"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Morbi"],
  "Haryana": ["Faridabad","Gurugram","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula"],
  "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamsala","Kullu","Hamirpur","Chamba","Una","Bilaspur","Nahan"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih","Ramgarh","Phusro","Medininagar"],
  "Karnataka": ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi","Davanagere","Ballari","Vijayapura","Shivamogga","Tumakuru"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kottayam","Kannur"],
  "Madhya Pradesh": ["Indore","Bhopal","Jabalpur","Gwalior","Ujjain","Sagar","Ratlam","Satna","Dewas","Murwara"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Thane","Nashik","Aurangabad","Solapur","Amravati","Navi Mumbai","Kolhapur"],
  "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur","Ukhrul","Senapati","Chandel","Tamenglong","Jiribam","Moreh"],
  "Meghalaya": ["Shillong","Tura","Jowai","Nongpoh","Baghmara","Williamnagar","Resubelpara","Nongstoin","Mairang","Khliehriat"],
  "Mizoram": ["Aizawl","Lunglei","Saiha","Champhai","Kolasib","Serchhip","Lawngtlai","Mamit","Hnahthial","Khawzach"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunieboto","Mon","Phek","Longleng","Kiphire"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Pathankot","Hoshiarpur","Batala","Moga"],
  "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar"],
  "Sikkim": ["Gangtok","Namchi","Mangan","Gyalshing","Rangpo","Jorethang","Nayabazar","Singtam","Ravangla","Yuksom"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Vellore","Erode","Thoothukudi","Dindigul"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Adilabad","Suryapet","Miryalaguda"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar","Kailasahar","Belonia","Khowai","Ambassa","Sonamura","Sabroom","Teliamura"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Ghaziabad","Bareilly","Aligarh","Moradabad"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Kotdwar","Ramnagar","Mussoorie"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Baharampur","Habra","Kharagpur"],
  "Andaman and Nicobar Islands": ["Port Blair","Car Nicobar","Little Andaman","Diglipur","Rangat","Mayabunder","Ferrargunj","Prothrapur","Nancowrie","Campbell Bay"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman","Diu","Silvassa"],
  "Delhi": ["New Delhi","Central Delhi","East Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Jammu and Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Sopore","Kathua","Udhampur","Poonch","Leh","Kargil"],
  "Ladakh": ["Leh","Kargil"],
  "Lakshadweep": ["Kavaratti","Agatti","Amini","Andrott","Kadmat"],
  "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"]
};

const STATES = Object.keys(INDIA_STATES_CITIES);

const CompleteProfile = ({ profile, user, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailValue, setEmailValue] = useState(profile?.email || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [signatureBlob, setSignatureBlob] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const availableCities = selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [];

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity('');
  };

  const compressImage = async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file instanceof Blob ? file : file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = (maxDim / width) * height;
            width = maxDim;
          } else if (height > maxDim) {
            width = (maxDim / height) * width;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
        };
      };
    });
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Could not access camera: ' + err.message);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        setProfilePhoto(blob);
        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = async (file, path) => {
    if (!file) return '';
    const fileExt = 'jpg';
    const fileName = `${profile.id}/${path}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('aadhaar_cards').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('aadhaar_cards').getPublicUrl(fileName);
    return publicUrl;
  };

  const sendEmailNotification = async (candidateData) => {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: "33b16dfe-bac0-40f9-8137-1c00c3b758f8",
          subject: `NEW REGISTRATION: ${profile.full_name}`,
          from_name: "isuccessnode Portal",
          recipient: "kabirhaldar4444@gmail.com",
          message: `
            A new candidate has completed their profile:
            - Name: ${profile?.full_name || 'New Candidate'}
            - Email: ${emailValue || user?.email || 'N/A'}
            - Phone: ${candidateData.phone}
            - Location: ${candidateData.location}
            
            UPLOADED DOCUMENTS:
            - Profile Photo: ${candidateData.photoUrl}
            - Aadhaar (Front): ${candidateData.frontUrl}
            - Aadhaar (Back): ${candidateData.backUrl}
            - PAN Card: ${candidateData.panUrl}
            - Signature: ${candidateData.signUrl}
          `
        })
      });
    } catch (err) {
      console.error('Email Notification Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!profilePhoto) return setError('Please take a profile photo to continue.');
    if (!signatureBlob) return setError('Please provide your digital signature.');
    if (!panCard) return setError('Please upload your PAN card.');
    if (!emailValue) return setError('Please provide a valid email address.');
    if (!acceptedTerms) return setError('Please accept the exam terms to continue.');
    
    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('91') || digits.length !== 12) return setError('Please enter a valid 10-digit mobile number.');
    if (!selectedState) return setError('Please select your state.');
    if (!selectedCity) return setError('Please select your city.');

    setUploading(true);
    setUploadStatus('Processing documents...');
    
    try {
      const [compPhoto, compFront, compBack, compPan] = await Promise.all([
        compressImage(profilePhoto),
        compressImage(aadhaarFront),
        compressImage(aadhaarBack),
        compressImage(panCard)
      ]);

      setUploadStatus('Uploading files...');

      const [photoUrl, frontUrl, backUrl, panUrl, signUrl] = await Promise.all([
        handleFileUpload(compPhoto, 'profile-photo'),
        handleFileUpload(compFront, 'front'),
        handleFileUpload(compBack, 'back'),
        handleFileUpload(compPan, 'pan-card'),
        handleFileUpload(signatureBlob, 'signature')
      ]);

      setUploadStatus('Finalizing profile...');

      const fullAddress = `${address ? address + ', ' : ''}${selectedCity}, ${selectedState}`;

      const { error } = await supabase.from('profiles').update({
        phone,
        address: fullAddress,
        aadhaar_front_url: frontUrl,
        aadhaar_back_url: backUrl,
        pan_url: panUrl,
        signature_url: signUrl,
        profile_photo_url: photoUrl,
        profile_completed: true
      }).eq('id', profile.id);

      if (error) throw error;
      
      await sendEmailNotification({
        phone,
        email: emailValue,
        location: `${selectedCity}, ${selectedState}`,
        photoUrl,
        frontUrl,
        backUrl,
        panUrl,
        signUrl
      });

      if (onComplete) await onComplete();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-200 focus:outline-none transition-all duration-300 text-slate-900 font-medium placeholder:text-slate-300";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2";

  return (
    <>
    <DisclaimerOverlay user={user} profile={profile} />
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans selection:bg-slate-200">
      <div className="max-w-5xl mx-auto animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Complete Your Profile</h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
            Please provide your details and documents to verify your identity and access your exams
          </p>
        </div>

        {error && (
          <div className="mb-12 p-8 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-4 animate-slide-up">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Personal Info */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] p-12 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900" />
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Personal Information</h2>
            </div>

            <div className="flex flex-col items-center gap-8 p-10 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] mb-12 group transition-all hover:bg-white hover:shadow-xl duration-500">
              <div className="text-center">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Profile Photo</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Please take a clear photo of yourself</p>
              </div>

              {!showCamera && !profilePhoto && (
                <button type="button" onClick={startCamera} className="w-36 h-36 rounded-[3rem] bg-white border border-slate-100 shadow-2xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-all active:scale-95 group/cam">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover/cam:rotate-6 transition-transform">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                  </div>
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Start Camera</span>
                </button>
              )}

              {showCamera && (
                <div className="relative w-full max-w-sm">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-[2.5rem] bg-slate-900 shadow-2xl border-4 border-white" />
                  <button type="button" onClick={capturePhoto} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] py-4 px-10 rounded-2xl shadow-2xl hover:bg-slate-800 transition-all border border-slate-700">Capture Photo</button>
                </div>
              )}

              {profilePhoto && !showCamera && (
                <div className="relative">
                  <img src={URL.createObjectURL(profilePhoto)} alt="Candidate" className="w-40 h-40 rounded-[3rem] object-cover shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border-4 border-white" />
                  <button type="button" onClick={startCamera} className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-2xl">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15"/></svg>
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} className={`${inputClass} !bg-slate-50 !text-slate-400 cursor-not-allowed`} readOnly />
              </div>

              <div className="space-y-4">
                <label className={labelClass}>Phone Number</label>
                <div className="flex gap-4">
                  <div className="flex items-center px-6 bg-slate-900 border border-slate-900 rounded-[2rem] font-black text-xs text-white shadow-xl shadow-slate-100">+91</div>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone.replace(/^\+91\s?/, '')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone('+91 ' + raw);
                      setPhoneError(raw.length === 10 ? '' : 'Please enter 10 digits');
                    }}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className={labelClass}>State / Union Territory</label>
                <select value={selectedState} onChange={handleStateChange} className={`${inputClass} appearance-none cursor-pointer`} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>City / District</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`} required disabled={!selectedState}>
                  <option value="">{selectedState ? 'Select City' : 'Select State First'}</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className={labelClass}>Permanent Address</label>
              <input
                type="text"
                placeholder="Street, Locality, House No."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Section 2: Documents */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] p-12 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900" />
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Verification Documents</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { label: 'Aadhaar (Front)', state: aadhaarFront, setter: setAadhaarFront },
                { label: 'Aadhaar (Back)', state: aadhaarBack, setter: setAadhaarBack },
                { label: 'PAN Card', state: panCard, setter: setPanCard }
              ].map(({ label, state, setter }) => (
                <div key={label} className="space-y-4">
                  <label className={labelClass}>{label}</label>
                  <div className="relative h-44 group/file">
                    <input type="file" accept="image/*" onChange={e => setter(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    <div className={`h-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 px-8 text-center ${state ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600' : 'border-slate-100 bg-slate-50/50 group-hover/file:border-slate-300 text-slate-400'}`}>
                      {state ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-2xl shadow-emerald-100">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01.414 0z" clipRule="evenodd"/></svg>
                          </div>
                          <span className="text-[10px] font-black truncate w-full uppercase tracking-widest">{state.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white text-slate-300 flex items-center justify-center mb-4 group-hover/file:text-slate-900 transition-all shadow-sm">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest group-hover/file:text-slate-900 transition-colors">Upload Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Signature */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] p-12 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900" />
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Digital Signature</h2>
            </div>
            
            <div className="bg-slate-50/50 p-2 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
              <SignaturePad onSave={(blob) => setSignatureBlob(blob)} onClear={() => setSignatureBlob(null)} />
            </div>
          </div>

          {/* Section 4: Terms */}
          <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-20 border border-slate-800 shadow-[0_64px_128px_-32px_rgba(15,23,42,0.4)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
             
             <div className="relative z-10">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Legal Protocols</h2>
              </div>

              <div className="space-y-12">
                <div className="bg-white/5 rounded-[2rem] p-10 border border-white/10">
                  <div className="space-y-8 max-h-80 overflow-y-auto pr-6 custom-scrollbar text-sm text-slate-400 font-medium leading-relaxed">
                    <div className="space-y-2">
                      <h5 className="font-bold text-white uppercase text-[10px] tracking-widest">1. Identity Attribution</h5>
                      <p>I authorize the capture of my live photo and documents for the sole purpose of examination authentication. I understand that any attempt to misrepresent my identity will lead to immediate disqualification.</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-white uppercase text-[10px] tracking-widest">2. Service Disclaimer</h5>
                      <p>I acknowledge that this certification is for professional development. Successful completion does not guarantee employment or salary increases from any organization.</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-white uppercase text-[10px] tracking-widest">3. Integrity Covenant</h5>
                      <p>I agree to complete the examination independently without unauthorized aid. Detecting malpractice will result in a permanent ban from the platform.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <label className="flex items-center gap-6 cursor-pointer group/check">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        required
                        checked={acceptedTerms}
                        onChange={e => setAcceptedTerms(e.target.checked)}
                        className="w-10 h-10 rounded-xl border-2 border-slate-700 bg-transparent text-white focus:ring-0 transition-all cursor-pointer appearance-none checked:bg-white checked:border-white"
                      />
                      {acceptedTerms && (
                        <svg className="absolute top-2 left-2 w-6 h-6 text-slate-900 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover/check:text-white transition-colors">
                      Establish Legal Binding
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={uploading || !acceptedTerms}
                    className={`px-16 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl ${
                      acceptedTerms && !uploading
                        ? 'bg-white text-slate-900 hover:bg-slate-100 hover:-translate-y-2 shadow-white/10'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                        <span>{uploadStatus || 'Processing...'}</span>
                      </div>
                    ) : (
                      <>
                        Complete Registration
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="animate-pulse"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
             </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default CompleteProfile;
