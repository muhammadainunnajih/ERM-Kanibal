
import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  PlusCircle, 
  ChevronRight, 
  Search,
  ExternalLink,
  Bot,
  Activity,
  X,
  Send,
  Sparkles,
  Stethoscope,
  Brain
} from 'lucide-react';
import { StatCardProps, Patient } from '../types';
import { getMedicalInsight } from '../services/geminiService';

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
    </div>
    <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center text-white shadow-inner`}>
      {icon}
    </div>
  </div>
);

interface DashboardProps {
  patients: Patient[];
  onAddPatient: () => void;
  clinicName: string;
  clinicLogo?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, onAddPatient, clinicName, clinicLogo }) => {
  const latestPatients = patients.slice(0, 5);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSymptoms, setAiSymptoms] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSymptoms.trim()) return;
    
    setIsAiLoading(true);
    const insight = await getMedicalInsight(aiSymptoms);
    setAiResult(insight || "Gagal mendapatkan analisa AI.");
    setIsAiLoading(false);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setAiResult(null);
    setAiSymptoms('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 overflow-hidden">
            {clinicLogo ? <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-cover" /> : <Activity size={32} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{clinicName}</h2>
            <p className="text-gray-500 font-medium">Monitoring data dan aktivitas rekam medis hari ini.</p>
          </div>
        </div>
        <button 
          onClick={onAddPatient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <PlusCircle size={20} />
          <span>Tambah Pasien Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Pasien Terdaftar" value={patients.length} icon={<Users size={28} />} iconBgColor="bg-blue-500" />
        <StatCard label="Rekam Medis Tersimpan" value={patients.length > 0 ? patients.length + 5 : 0} icon={<FileText size={28} />} iconBgColor="bg-emerald-500" />
        <StatCard label="Kunjungan Pasien Hari Ini" value={Math.min(patients.length, 2)} icon={<Calendar size={28} />} iconBgColor="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 pb-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Pasien Terakhir</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center uppercase tracking-widest">
              Lihat Semua <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="flex-1">
            <div className="divide-y divide-gray-50">
              {latestPatients.map((p) => (
                <div key={p.id} className="p-6 px-10 hover:bg-blue-50/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">{p.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-black text-gray-900 text-lg tracking-tight group-hover:text-blue-700 transition-colors">{p.name}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No. RM: {p.rmNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-500">{p.lastVisit}</p>
                    <button className="text-[10px] text-blue-500 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-auto mt-1">Detail <ExternalLink size={10} className="ml-1" /></button>
                  </div>
                </div>
              ))}
              {latestPatients.length === 0 && <div className="p-20 text-center text-gray-300 italic font-medium">Belum ada pasien terdaftar hari ini.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Menu Akses Cepat</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center p-5 rounded-3xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-blue-600 group-hover:text-white transition-all"><Search size={24} /></div>
                <div className="text-left">
                  <p className="font-black text-gray-900 text-sm uppercase tracking-widest">Cari Data Pasien</p>
                  <p className="text-xs text-gray-400 font-medium">Akses seluruh database pasien</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <Bot size={28} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">Asisten AI Medis</h3>
            </div>
            <p className="text-sm text-indigo-50/80 leading-relaxed mb-8 relative z-10">Analisis diagnosa pasien dan rekomendasikan tindakan medis berbasis protokol kesehatan secara instan.</p>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="w-full bg-white text-indigo-700 font-black text-xs py-4 rounded-2xl hover:bg-blue-50 transition-all uppercase tracking-[.25em] shadow-xl relative z-10 active:scale-95"
            >
              Mulai Konsultasi AI
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">AI Medical Insight</h3>
                  <p className="text-indigo-100 text-xs">Powered by Gemini AI Technology</p>
                </div>
              </div>
              <button onClick={closeAiModal} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!aiResult ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain size={20} />
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl rounded-tl-none border border-indigo-100">
                      <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                        Halo Dok! Saya Asisten AI Klinik Sehat. Masukkan keluhan atau gejala pasien di bawah ini, saya akan membantu memberikan analisa ringkas dan referensi diagnosa.
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleAiConsult} className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Gejala / Keluhan</label>
                    <textarea 
                      required
                      value={aiSymptoms}
                      onChange={(e) => setAiSymptoms(e.target.value)}
                      placeholder="Contoh: Pasien laki-laki 35th, demam naik turun 3 hari, menggigil, nyeri sendi, ada bintik merah di lengan..."
                      rows={4}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[32px] outline-none font-medium text-gray-800 transition-all resize-none shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={isAiLoading}
                      className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[.2em] rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Menganalisis Data...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Dapatkan Analisa</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Status Analisa</p>
                      <p className="text-sm font-bold text-emerald-900">Analisa Berhasil Disusun</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm">
                    <div className="flex items-center space-x-2 mb-6">
                      <Sparkles size={16} className="text-indigo-600" />
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Hasil Medical Insight</h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiResult}
                    </div>
                  </div>

                  <button 
                    onClick={() => setAiResult(null)}
                    className="w-full py-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-2xl transition-all"
                  >
                    Konsultasi Baru
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-orange-500 flex-shrink-0" size={16} />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                  Disclaimer: Analisa AI ini hanya bersifat referensi medis. Diagnosa final tetap berada pada otoritas Dokter pemeriksa yang berwenang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
