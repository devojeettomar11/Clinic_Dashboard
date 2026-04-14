import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, ShieldCheck, Upload, Clock, Activity } from 'lucide-react';
import useAuthStore from '../../auth/store/authStore';
import { getMyClinic, setupClinic, uploadClinicLicense } from '../api/clinicApi';
// CORRECT
import FilePreview from '../../../components/common/FilePreview';

export default function ClinicSetupPage() {
  const navigate  = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuthStore();

  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice]   = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [licenseUrl, setLicenseUrl]   = useState('');
  const [previewUrl, setPreviewUrl]   = useState('');

  const [locationForm, setLocationForm] = useState({
    clinicName: '', ownerName: '', city: '', address: '', pinCode: '',
    location: null, type: 'General', mode: 'In-person',
  });

  const [adminForm, setAdminForm] = useState({
    adminEmail: '', phone: '', otp: '', otpSent: false, verified: false,
  });

  const [clinicPrefs, setClinicPrefs] = useState({ openTime: '09:00', closeTime: '19:00' });

  const setTemporaryNotice = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  useEffect(() => {
    const loadClinic = async () => {
      try {
        setLoading(true);
        const response = await getMyClinic();
        if (response.data.success && response.data.data) {
          const clinic = response.data.data;
          setLocationForm({ clinicName: clinic.name || '', ownerName: clinic.ownerName || '', city: clinic.city || '', address: clinic.address || '', pinCode: clinic.pinCode || '', location: clinic.location || null, type: clinic.type || 'General', mode: clinic.mode || 'In-person' });
          const isVerified = user?.isVerified || clinic.isVerified || false;
          setAdminForm((p) => ({ ...p, adminEmail: user?.email, phone: clinic.contactNumber || user?.phone || '', verified: isVerified }));
          setClinicPrefs({ openTime: clinic.openTime || '09:00', closeTime: clinic.closeTime || '19:00' });
          setLicenseUrl(clinic.licenseFileUrl || user?.licenseUrl || '');
          if (clinic.status === 'active') { setIsSetupCompleted(true); setActiveStep(4); }
          else if (!clinic.licenseFileUrl && !user?.licenseUrl) setActiveStep(1);
          else if (!clinic.location) setActiveStep(2);
          else if (!isVerified) setActiveStep(3);
          else setActiveStep(4);
        } else {
          setAdminForm((p) => ({ ...p, adminEmail: user?.email || '', phone: user?.phone || '', verified: user?.isVerified || false }));
          if (user?.licenseUrl) { setLicenseUrl(user.licenseUrl); setActiveStep(2); }
          else setActiveStep(1);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadClinic();
  }, [user]);

  useEffect(() => {
    return () => { if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const steps = useMemo(() => [
    { id: 1, title: 'Upload License', icon: Upload },
    { id: 2, title: 'Clinic Location', icon: MapPin },
    { id: 3, title: 'Admin Verification', icon: ShieldCheck },
    { id: 4, title: 'Clinic Activated', icon: CheckCircle2 },
  ], []);

  const progressPercent = useMemo(() => {
    if (isSetupCompleted) return 100;
    let completed = 0;
    if (licenseUrl) completed++;
    if (locationForm.clinicName && locationForm.city && locationForm.address) completed++;
    if (adminForm.verified) completed++;
    if (activeStep >= 4) completed++;
    return Math.floor((completed / 4) * 100);
  }, [isSetupCompleted, licenseUrl, locationForm, adminForm, activeStep]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setTemporaryNotice('Uploading license...');
      setPreviewUrl(URL.createObjectURL(file));
      const res = await uploadClinicLicense(file);
      if (res.data.success) { setLicenseUrl(res.data.data.fileUrl); setUploadedFile(file); setTemporaryNotice('License uploaded!'); }
    } catch { setTemporaryNotice('Error uploading license.'); }
  };

  const onDetectLocation = () => {
    if (!navigator.geolocation) { setTemporaryNotice('Geolocation not supported.'); return; }
    setTemporaryNotice('Detecting location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocationForm((p) => ({ ...p, location: { type: 'Point', coordinates: [coords.longitude, coords.latitude] } })); setTemporaryNotice('Location detected!'); },
      () => setTemporaryNotice('Unable to retrieve location.')
    );
  };

  const onSaveLocation = async () => {
    if (!locationForm.clinicName || !locationForm.city || !locationForm.address) { setTemporaryNotice('Please fill required fields.'); return; }
    try {
      const res = await setupClinic({ name: locationForm.clinicName, ownerName: locationForm.ownerName, address: locationForm.address, city: locationForm.city, pinCode: locationForm.pinCode, location: locationForm.location, type: locationForm.type, mode: locationForm.mode, licenseFileUrl: licenseUrl });
      if (res.data.success) { setActiveStep(3); setTemporaryNotice('Location saved!'); }
    } catch { setTemporaryNotice('Error saving clinic details.'); }
  };

  const onSendOtp = () => { setAdminForm((p) => ({ ...p, otpSent: true })); setTemporaryNotice(`OTP sent to ${user?.email}. (Use 123456 for demo)`); };

  const onVerifyOtp = async () => {
    if (adminForm.otp !== '123456') { setTemporaryNotice('Invalid OTP.'); return; }
    try {
      const res = await setupClinic({ isVerified: true, contactNumber: adminForm.phone });
      if (res.data.success) { setAdminForm((p) => ({ ...p, verified: true })); setActiveStep(4); setTemporaryNotice('Verified!'); }
    } catch { setTemporaryNotice('Error verifying OTP.'); }
  };

  const onSubmitSetup = async () => {
    try {
      const res = await setupClinic({ openTime: clinicPrefs.openTime, closeTime: clinicPrefs.closeTime });
      if (res.data.success) { setIsSetupCompleted(true); updateUser({ clinic: res.data.data }); setTemporaryNotice('Setup submitted for review!'); }
    } catch { setTemporaryNotice('Error submitting setup.'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-sky-500 border-gray-200 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {notice && (
        <div className="fixed top-6 right-6 z-50 bg-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">{notice}</div>
      )}

      <section className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-sky-900 leading-none">Clinic Setup</h1>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border ${user?.clinic?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user?.clinic?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {user?.clinic?.status === 'active' ? 'Active' : 'Pending Activation'}
            </span>
          </div>
          <p className="text-slate-500 mt-1">Align your healthcare services to start receiving bookings.</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Progress</span>
          <strong className="text-2xl text-sky-600">{progressPercent}%</strong>
        </div>
      </section>

      <section className="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between gap-4">
          {steps.map((step) => (
            <button key={step.id} type="button"
              className={`flex-1 flex flex-col items-center gap-2 group transition-all ${activeStep === step.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              onClick={() => setActiveStep(step.id)}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${progressPercent >= step.id * 25 ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-slate-100 text-slate-400'}`}>
                {progressPercent >= step.id * 25 ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${activeStep === step.id ? 'text-sky-600' : 'text-slate-400'}`}>{step.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 1 */}
      <article className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-xl ${activeStep === 1 ? 'block' : 'hidden'}`}>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0"><Upload size={24} /></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Upload Clinic License</h2>
            <p className="text-slate-500 text-sm mb-6">Upload your medical practice or clinic registration document.</p>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center text-center">
              <button type="button" className="px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm font-bold text-slate-700 hover:bg-slate-50 transition-all mb-4"
                onClick={() => fileInputRef.current?.click()}>Select License File</button>
              <p className="text-xs text-slate-400 mb-2">{uploadedFile ? uploadedFile.name : licenseUrl ? 'License document verified' : 'No file chosen'}</p>
              {(previewUrl || licenseUrl) && (
                <FilePreview fileUrl={previewUrl || licenseUrl} fileName={uploadedFile?.name || 'Clinic License'}
                  onClear={() => { setLicenseUrl(''); setPreviewUrl(''); setUploadedFile(null); }} />
              )}
              <input ref={fileInputRef} className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600" onClick={() => navigate('/clinic/dashboard')}>Cancel</button>
              <button type="button" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all" onClick={() => setActiveStep(2)}>Continue</button>
            </div>
          </div>
        </div>
      </article>

      {/* Step 2 */}
      <article className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-xl ${activeStep === 2 ? 'block' : 'hidden'}`}>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0"><MapPin size={24} /></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Clinic Location & Details</h2>
            <p className="text-slate-500 text-sm mb-6">Provide details about your healthcare facility.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Clinic Name', key: 'clinicName', placeholder: 'Official Clinic Name', span: false },
                { label: 'Owner/In-charge Name', key: 'ownerName', placeholder: 'Owner Name', span: false },
                { label: 'City', key: 'city', placeholder: 'City Name', span: false },
                { label: 'Pin Code', key: 'pinCode', placeholder: '6-digit Pin', span: false },
                { label: 'Full Address', key: 'address', placeholder: 'Complete address', span: true },
              ].map(({ label, key, placeholder, span }) => (
                <div key={key} className={`space-y-1 ${span ? 'md:col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    placeholder={placeholder} value={locationForm[key]}
                    onChange={(e) => setLocationForm((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="flex items-center gap-4 md:col-span-2 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                <button type="button" className="px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2" onClick={onDetectLocation}>
                  <MapPin size={14} /> Detect Map Location
                </button>
                {locationForm.location?.coordinates && (
                  <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1"><CheckCircle2 size={12} /> COORDINATES CAPTURED</span>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4 md:col-span-2">
                <button type="button" className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600" onClick={() => setActiveStep(1)}>Back</button>
                <button type="button" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all" onClick={onSaveLocation}>Save & Continue</button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Step 3 */}
      <article className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-xl ${activeStep === 3 ? 'block' : 'hidden'}`}>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0"><ShieldCheck size={24} /></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Admin Identity Verification</h2>
            <p className="text-slate-500 text-sm mb-6">Confirm clinical administrator contact information.</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Verification Email</label>
                {adminForm.verified ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><ShieldCheck size={16} /></div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Email Verified</p>
                      <p className="text-[10px] text-emerald-600/70">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                      value={user?.email || ''} readOnly />
                    <button type="button" onClick={onSendOtp}
                      className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition-all">Send OTP</button>
                  </div>
                )}
              </div>
              {!adminForm.verified && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Enter OTP</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    placeholder="6-digit OTP" value={adminForm.otp}
                    onChange={(e) => setAdminForm((p) => ({ ...p, otp: e.target.value }))} />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600" onClick={() => setActiveStep(2)}>Back</button>
                <button type="button" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all"
                  onClick={adminForm.verified ? () => setActiveStep(4) : onVerifyOtp}>
                  {adminForm.verified ? 'Continue' : 'Verify & Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Step 4 */}
      <article className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-xl ${activeStep === 4 ? 'block' : 'hidden'}`}>
        <div className="flex items-start gap-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${user?.clinic?.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-sky-50 text-sky-500'}`}>
            {user?.clinic?.status === 'active' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {user?.clinic?.status === 'active' ? 'Clinic Activation Successful' : 'Clinic Operational Hours'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {user?.clinic?.status === 'active' ? 'Your clinic is currently active and visible to patients.' : 'Define your working hours to complete setup.'}
            </p>
            {user?.clinic?.status === 'active' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Status: Active
                  </div>
                  <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                    Hours: {clinicPrefs.openTime} - {clinicPrefs.closeTime}
                  </div>
                </div>
                <button type="button" onClick={() => navigate('/clinic/dashboard')}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all mt-2">
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                {[{ label: 'Opening', key: 'openTime' }, { label: 'Closing', key: 'closeTime' }].map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Clock size={10} /> {label}</label>
                    <input type="time"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      value={clinicPrefs[key]} onChange={(e) => setClinicPrefs((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="col-span-2 mt-4">
                  <button type="button"
                    className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all flex items-center gap-2"
                    onClick={onSubmitSetup}>
                    <Activity size={18} /> Submit for Admin Approval
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {user?.clinic?.status === 'pending' && isSetupCompleted && (
        <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 text-amber-800">Setup Submitted!</h3>
            <p className="text-amber-600 text-sm">Your profile is being reviewed. This typically takes 24-48 hours.</p>
          </div>
          <div className="px-6 py-2 bg-amber-200 text-amber-800 rounded-full font-bold text-xs animate-pulse">Under Review</div>
        </div>
      )}
    </div>
  );
}
