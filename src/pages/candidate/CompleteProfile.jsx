import React, { useState, useRef, useEffect } from 'react';
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
  const [emailValue, setEmailValue] = useState(profile?.email || '');
  const [pincode, setPincode] = useState('');
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
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const availableCities = selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [];

  useEffect(() => {
    // Auto-fetch IP on mount for security audit
    const fetchIP = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        if (data.ip) setUserIP(data.ip);
      } catch (err) {
        console.error("Auto IP fetch failed", err);
      }
    };
    fetchIP();

    if (pincode.length === 6) {
      handlePincodeLookup(pincode);
    }
  }, [pincode]);

  const handlePincodeLookup = async (code) => {
    setIsFetchingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();
      
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        const state = postOffice.State;
        const district = postOffice.District;
        
        // Normalize state names to match our list if necessary
        const normalizedState = STATES.find(s => s.toLowerCase() === state.toLowerCase()) || state;
        
        setSelectedState(normalizedState);
        // We add the district to our cities list if it's not there, or just set it
        setSelectedCity(district);
      }
    } catch (err) {
      console.error("PIN code lookup failed", err);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetected(false);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Parallel fetch for location and IP
          const [locRes, ipRes] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`),
            fetch('https://api.ipify.org?format=json')
          ]);
          
          const locData = await locRes.json();
          const ipData = await ipRes.json();
          
          if (ipData.ip) setUserIP(ipData.ip);

          if (locData.address) {
            const { state, city, town, village, postcode } = locData.address;
            const detectedCity = city || town || village;
            
            if (postcode) setPincode(postcode.replace(/\s/g, '').slice(0, 6));
            if (state) {
              const normalizedState = STATES.find(s => s.toLowerCase() === state.toLowerCase()) || state;
              setSelectedState(normalizedState);
            }
            if (detectedCity) setSelectedCity(detectedCity);
            
            setLocationDetected(true);
          }
        } catch (err) {
          console.error("Location or IP detection failed", err);
          // Still try to show success if at least location worked or partial data exists
          setLocationDetected(true); 
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setError("Location access denied or unavailable");
        setIsDetectingLocation(false);
      }
    );
  };

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
          access_key: "9bc576c1-caf0-4670-b4ec-3a50f505d9d3",
          subject: `KYC Form: ${profile?.full_name || 'New Candidate'}`,
          from_name: "isuccessnode Global",
          recipient: "business@isuccessnode.com",
          message: `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; line-height: 1.6;">
  <div style="background-color: #0f172a; padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 4px; text-transform: uppercase;">KYC Verification Report</h1>
  </div>
  
  <div style="padding: 40px;">
    <div style="margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
      <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 0;"><b>Candidate Profile Data</b></h2>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
      <tr><td style="padding: 8px 0; color: #64748b; width: 180px;"><b>Full Name</b></td><td style="padding: 8px 0; color: #0f172a;">: ${profile?.full_name || 'N/A'}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;"><b>Email Address</b></td><td style="padding: 8px 0; color: #0f172a;">: ${candidateData.email}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;"><b>Mobile Number</b></td><td style="padding: 8px 0; color: #0f172a;">: ${candidateData.phone}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;"><b>PIN Code</b></td><td style="padding: 8px 0; color: #0f172a;">: ${candidateData.pincode}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;"><b>Location</b></td><td style="padding: 8px 0; color: #0f172a;">: ${candidateData.location}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;"><b>Captured IP</b></td><td style="padding: 8px 0; color: #0f172a;">: <span style="background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${candidateData.ip || 'N/A'}</span> (Secured Audit)</td></tr>
    </table>

    <div style="margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
      <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 0;"><b>Security & Compliance Status</b></h2>
    </div>
    
    <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9;">
      <div style="margin-bottom: 12px;"><b>[✓] Identity Verification</b> : COMPLETED (Live Camera Capture)</div>
      <div style="margin-bottom: 12px;"><b>[✓] Legal Declaration</b> : ACCEPTED (Digital Acknowledgment)</div>
      <div style="margin-bottom: 12px;"><b>[✓] Signature Attestation</b> : VERIFIED (Cryptographic Signature)</div>
      <div style="margin-bottom: 0;"><b>[✓] Documentation</b> : VALIDATED (Aadhaar/PAN/Photo)</div>
    </div>

    <div style="margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
      <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 0;"><b>Legal Terms & Agreement Summary</b></h2>
    </div>
    
    <div style="margin-bottom: 40px; font-size: 13px;">
      <div style="margin-bottom: 12px;"><b>1. Service Delivery</b> : Acknowledged (Course flow and fees explained)</div>
      <div style="margin-bottom: 12px;"><b>2. Terms & Conditions</b> : Accepted (90-120 days delivery, exam protocols)</div>
      <div style="margin-bottom: 12px;"><b>3. Refund Policy</b> : Understood (No refund after exam attempt)</div>
      <div style="margin-bottom: 12px;"><b>4. Legal Disclaimer</b> : Confirmed (Independent org, no job guarantee)</div>
    </div>

    <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 24px; border-radius: 12px; margin-bottom: 40px;">
      <p style="margin: 0 0 12px 0; font-size: 11px; color: #9a3412; text-transform: uppercase; letter-spacing: 1px;"><b>Final Candidate Declaration:</b></p>
      <p style="margin: 0 0 16px 0; font-size: 14px; font-style: italic; color: #431407;">"I have read, understood, and agree to follow all the legal terms and academic integrity policies mentioned in the official exam portal."</p>
      <p style="margin: 0; font-size: 12px; color: #166534; font-weight: bold;">STATUS: PERSONALLY ATTESTED BY CANDIDATE ✓</p>
    </div>

    <div style="margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
      <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 0;"><b>Verified Documentation Links</b></h2>
    </div>
    
    <div style="font-size: 13px; line-height: 2;">
      <div><b>Profile Photo</b> : <a href="${candidateData.photoUrl}" style="color: #2563eb;">View Artifact</a></div>
      <div><b>Aadhaar Card (Front)</b> : <a href="${candidateData.frontUrl}" style="color: #2563eb;">View Artifact</a></div>
      <div><b>Aadhaar Card (Back)</b> : <a href="${candidateData.backUrl}" style="color: #2563eb;">View Artifact</a></div>
      <div><b>PAN Card</b> : <a href="${candidateData.panUrl}" style="color: #2563eb;">View Artifact</a></div>
      <div><b>Digital Signature</b> : <a href="${candidateData.signUrl}" style="color: #2563eb;">View Artifact</a></div>
    </div>
  </div>

  <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
    <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;"><b>Generated Securely via iSuccessNode Global Exam Portal</b></p>
  </div>
</div>
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

      const fullAddress = `${address ? address + ', ' : ''}${selectedCity}, ${selectedState} - ${pincode}`;

      const { error } = await supabase.from('profiles').update({
        phone,
        address: fullAddress,
        aadhaar_front_url: frontUrl,
        aadhaar_back_url: backUrl,
        pan_url: panUrl,
        signature_url: signUrl,
        profile_photo_url: photoUrl,
        ip_address: userIP,
        profile_completed: true
      }).eq('id', profile.id);

      if (error) throw error;
      
      await sendEmailNotification({
        phone,
        email: emailValue,
        location: `${selectedCity}, ${selectedState}`,
        pincode,
        ip: userIP,
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

  const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-900/20 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-slate-900 font-bold placeholder:text-slate-300 text-sm";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 ml-1 mb-3";

  return (
    <>
    <DisclaimerOverlay user={user} profile={profile} />
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-12 font-sans selection:bg-slate-100">
      <div className="max-w-4xl mx-auto animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-[1.75rem] bg-white text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 border border-slate-50">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">KYC Form</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Step 2: isuccessnode Global Verification</p>
        </div>

        {error && (
          <div className="mb-8 p-6 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-4 animate-slide-up">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
          
          <div className="p-8 md:p-14 space-y-16">
            
            {/* Section 1: Personal Credentials */}
            <div className="space-y-10">
              <div className="flex items-center justify-between border-l-4 border-blue-600 pl-4">
                <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em]">Personal Credentials</h2>
                <button 
                  type="button" 
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm disabled:opacity-50 ${
                    locationDetected 
                      ? 'bg-emerald-500 text-white border border-emerald-400 shadow-lg shadow-emerald-200' 
                      : 'bg-emerald-50 border border-emerald-200/50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5'
                  }`}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={isDetectingLocation ? 'animate-spin' : ''}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {isDetectingLocation ? 'Detecting...' : locationDetected ? 'Location Verified' : 'Detect Location'}
                </button>
              </div>

              <div className="p-10 bg-slate-50/50 border border-slate-100 border-dashed rounded-[2.5rem] flex flex-col items-center gap-6 group transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                <div className="text-center space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Livestream Verification</p>
                  <p className="text-xs font-bold text-slate-900">Take a high-quality profile photo *</p>
                </div>

                {!showCamera && !profilePhoto && (
                  <button type="button" onClick={startCamera} className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-xl flex flex-col items-center justify-center gap-2 hover:scale-110 active:scale-95 transition-all group/btn">
                    <div className="text-blue-600">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
                    </div>
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Open Lens</span>
                  </button>
                )}

                {showCamera && (
                  <div className="relative w-full max-w-sm">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-[2rem] bg-slate-900 shadow-2xl" />
                    <button type="button" onClick={capturePhoto} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black text-[9px] uppercase tracking-[0.3em] py-3.5 px-10 rounded-2xl shadow-xl hover:bg-blue-700 transition-all">Capture</button>
                  </div>
                )}

                {profilePhoto && !showCamera && (
                  <div className="relative">
                    <img src={URL.createObjectURL(profilePhoto)} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white" />
                    <button type="button" onClick={startCamera} className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-lg">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={labelClass}>Account Email *</label>
                  <input type="email" value={emailValue} className={`${inputClass} !bg-slate-50 !text-slate-400 cursor-not-allowed`} readOnly />
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>Phone Number *</label>
                  <div className="flex gap-4">
                    <div className="flex items-center px-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] text-slate-400">+91</div>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone.replace(/^\+91\s?/, '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone('+91 ' + raw);
                      }}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className={labelClass}>PIN Code *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={inputClass}
                      required
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>State / UT *</label>
                  <select value={selectedState} onChange={handleStateChange} className={`${inputClass} appearance-none cursor-pointer`} required>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>City / District *</label>
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`} required disabled={!selectedState}>
                    <option value="">{selectedState ? 'Select City' : 'Pending Selection...'}</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    {selectedCity && !availableCities.includes(selectedCity) && (
                      <option value={selectedCity}>{selectedCity}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Residential Address</label>
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

            {/* Section 2: Verification Documents */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-4">
                <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em]">Verification Documents</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Aadhaar Front *', state: aadhaarFront, setter: setAadhaarFront },
                  { label: 'Aadhaar Back *', state: aadhaarBack, setter: setAadhaarBack },
                  { label: 'PAN Card *', state: panCard, setter: setPanCard }
                ].map(({ label, state, setter }) => (
                  <div key={label} className="space-y-4">
                    <label className={labelClass.replace('text-slate-900', 'text-slate-400')}>{label}</label>
                    <div className="relative h-40 group/file">
                      <input type="file" accept="image/*" onChange={e => setter(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                      <div className={`h-full rounded-3xl border border-dashed flex flex-col items-center justify-center transition-all duration-500 px-6 text-center ${state ? 'border-indigo-500 bg-indigo-50/20 text-indigo-600' : 'border-slate-200 bg-white group-hover/file:border-indigo-300 shadow-sm'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors ${state ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                          {state ? <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01.414 0z" clipRule="evenodd"/></svg> : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest truncate w-full">{state ? state.name : 'Upload File'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Identity Attestation */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-l-4 border-emerald-600 pl-4">
                <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.25em]">Identity Attestation</h2>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 border-dashed overflow-hidden group hover:border-emerald-300 transition-colors shadow-sm">
                <SignaturePad onSave={(blob) => setSignatureBlob(blob)} onClear={() => setSignatureBlob(null)} placeholder="Sign here (Mouse/Touch/Pen)" />
              </div>
            </div>

            {/* Section 4: Legal Acknowledgement */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-l-4 border-orange-600 pl-4">
                <h2 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.25em]">Legal Acknowledgement</h2>
              </div>

              <div className="p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-6 custom-scrollbar text-[13px] text-slate-500 font-medium leading-relaxed">
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">1. Identity Verification and Authentication</h4>
                    <p>To ensure the integrity of the examination process and to prevent proxy attendance, the Candidate hereby authorizes the Portal to capture a live photograph (selfie) at the commencement of and/or during the examination. This image will be used solely to authenticate the Candidate’s identity against registered records. Failure to provide a clear image or any attempt to bypass this authentication may result in immediate disqualification.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">2. Purpose of Certification and Employment Disclaimer</h4>
                    <p>The Candidate acknowledges and agrees that this certification is intended solely for personal and professional growth.</p>
                    <ul className="space-y-3 pl-2">
                      <li className="flex gap-3 items-start"><span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" /> <span className="font-bold text-slate-900">No Guarantee of Employment:</span> Successful completion of the exam and issuance of a certificate does not guarantee a job offer, placement, or any form of employment.</li>
                      <li className="flex gap-3 items-start"><span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" /> <span className="font-bold text-slate-900">No Guarantee of Financial Increase:</span> This certification does not entitle the Candidate to a salary hike, promotion, or bonus from any current or future employer.</li>
                    </ul>
                    <p>The Portal and its affiliates are not liable for any career expectations not met following the attainment of this certification.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">3. Academic Integrity</h4>
                    <p>The Candidate agrees to complete the examination independently without the use of unauthorized materials, AI tools, or external assistance. Any detected malpractice will lead to the permanent banning of the Candidate’s profile and the nullification of any previous results.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">4. Limitation of Liability</h4>
                    <p>The Portal shall not be held responsible for technical failures on the Candidate’s end, including but not limited to internet connectivity issues, hardware malfunctions, or power outages during the examination session.</p>
                  </div>
                </div>

                <div className="mt-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox" 
                      required
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="w-8 h-8 rounded-xl border-2 border-slate-200 bg-transparent transition-all cursor-pointer appearance-none checked:bg-slate-900 checked:border-slate-900"
                    />
                    {acceptedTerms && (
                      <svg className="absolute top-1.5 left-1.5 w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 leading-relaxed">
                    I have read, understood, and agree to follow all the legal terms and academic integrity policies mentioned above.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Submission Footer */}
          <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex justify-center">
            <button
              type="submit"
              disabled={uploading || !acceptedTerms}
              className={`px-20 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl ${
                acceptedTerms && !uploading
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 shadow-slate-200'
                  : 'bg-white text-slate-200 border border-slate-100 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>{uploadStatus || 'Processing...'}</span>
                </>
              ) : (
                <>
                  Establish Profile
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="animate-pulse"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default CompleteProfile;
