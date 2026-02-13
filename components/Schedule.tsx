
import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, User, Calendar, MapPin, Plus, Search, 
  Trash2, Pencil, X, Check, AlertCircle, 
  PlayCircle, CheckCircle2, UserPlus, MoreVertical,
  Volume2, Megaphone
} from 'lucide-react';
import { QueueItem, Patient, Doctor } from '../types';

interface ScheduleProps {
  queues: QueueItem[];
  patients: Patient[];
  doctors: Doctor[];
  onAdd: (q: QueueItem) => void;
  onUpdate: (q: QueueItem) => void;
  onDelete: (id: string) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({ 
  queues, patients, doctors, onAdd, onUpdate, onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<QueueItem | null>(null);
  const [qToDelete, setQToDelete] = useState<string | null>(null);
  const [callingId, setCallingId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<QueueItem>>({
    patientName: '',
    patientId: '',
    doctorName: '',
    status: 'Menunggu',
    room: 'Poli Umum 1'
  });

  // Patient Search in Modal
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientRef.current && !patientRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.rmNumber.includes(patientSearch)
  );

  const filteredQueues = queues.filter(q => 
    q.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const waitingCount = queues.filter(q => q.status === 'Menunggu').length;
  const inProgress = queues.find(q => q.status === 'Sedang Diperiksa');
  const finishedCount = queues.filter(q => q.status === 'Selesai').length;

  const handleOpenModal = (q?: QueueItem) => {
    if (q) {
      setEditingQ(q);
      setFormData(q);
      setPatientSearch(q.patientName);
    } else {
      setEditingQ(null);
      const nextNum = queues.length + 1;
      setFormData({
        no: `A-${nextNum.toString().padStart(3, '0')}`,
        patientName: '',
        patientId: '',
        doctorName: doctors[0]?.name || '',
        status: 'Menunggu',
        room: 'Poli Umum 1',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
      setPatientSearch('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQ) {
      onUpdate({ ...editingQ, ...formData } as QueueItem);
    } else {
      const newQ: QueueItem = {
        ...formData,
        id: `q-${Date.now()}`,
      } as QueueItem;
      onAdd(newQ);
    }
    setIsModalOpen(false);
  };

  const updateStatus = (q: QueueItem, status: QueueItem['status']) => {
    onUpdate({ ...q, status });
  };

  const handleCallPatient = (q: QueueItem) => {
    // Visual feedback
    setCallingId(q.id);
    setTimeout(() => setCallingId(null), 3000);

    // Voice Announcement (TTS)
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      const cleanNo = q.no.replace('-', ' ');
      msg.text = `Antrian nomor ${cleanNo}, atas nama ${q.patientName}, silahkan menuju ke ${q.room}`;
      msg.lang = 'id-ID';
      msg.rate = 0.9;
      window.speechSynthesis.cancel(); // Stop any current speech
      window.speechSynthesis.speak(msg);
    }
  };

  const handleCallNext = () => {
    // 1. Mark current in-progress as finished
    if (inProgress) {
      updateStatus(inProgress, 'Selesai');
    }

    // 2. Find next waiting
    const nextWaiting = queues.find(q => q.status === 'Menunggu');
    if (nextWaiting) {
      updateStatus(nextWaiting, 'Sedang Diperiksa');
      // Auto call the next one
      handleCallPatient(nextWaiting);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jadwal & Antrian</h2>
          <p className="text-gray-500">Monitoring antrian pasien real-time hari ini.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-full max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari pasien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Tambah Antrian</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQueues.map((q) => (
              <div 
                key={q.id} 
                className={`bg-white rounded-3xl border shadow-sm p-6 flex flex-col justify-between relative overflow-hidden transition-all group ${
                  q.status === 'Sedang Diperiksa' ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'
                } ${callingId === q.id ? 'ring-4 ring-orange-200 shadow-xl' : ''}`}
              >
                {q.status === 'Sedang Diperiksa' && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest animate-pulse">
                    DI PERIKSA
                  </div>
                )}

                {callingId === q.id && (
                  <div className="absolute inset-0 bg-orange-500/5 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-300">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg animate-bounce">
                      <Megaphone size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Memanggil...</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 leading-none uppercase tracking-tighter">NO</span>
                    <span className="text-xl font-black text-gray-900 leading-none mt-1">{q.no.split('-')[1]}</span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-gray-400 space-x-1 mb-1.5">
                      <Clock size={14} />
                      <span className="text-xs font-bold text-gray-500">{q.time} WIB</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg tracking-widest uppercase ${
                        q.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 
                        q.status === 'Sedang Diperiksa' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{q.patientName}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{q.room}</p>
                      </div>
                    </div>
                    {q.status !== 'Selesai' && (
                      <button 
                        onClick={() => handleCallPatient(q)}
                        className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Panggil Pasien"
                      >
                        <Volume2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar size={14} className="text-gray-300" />
                      <span className="text-xs font-bold text-gray-600">{q.doctorName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleOpenModal(q)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Antrian"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => { setQToDelete(q.id); setIsDeleteModalOpen(true); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="mt-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {q.status === 'Menunggu' && (
                    <button 
                      onClick={() => updateStatus(q, 'Sedang Diperiksa')}
                      className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-1"
                    >
                      <PlayCircle size={14} />
                      <span>Mulai Periksa</span>
                    </button>
                  )}
                  {q.status === 'Sedang Diperiksa' && (
                    <button 
                      onClick={() => updateStatus(q, 'Selesai')}
                      className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 size={14} />
                      <span>Selesai</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredQueues.length === 0 && (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
              <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Belum ada antrian yang terdaftar hari ini.</p>
              <button 
                onClick={() => handleOpenModal()}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Tambah Antrian Pertama
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-8 flex items-center space-x-2">
              <Clock className="text-blue-600" size={20} />
              <span className="text-lg">Info Antrian</span>
            </h3>
            <div className="space-y-8">
              <div className={`text-center p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden group transition-all ${callingId === inProgress?.id ? 'ring-4 ring-orange-400' : ''}`}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-[.25em]">Sedang Diperiksa</p>
                <div className="flex items-center justify-center space-x-4">
                  <p className="text-5xl font-black">{inProgress ? inProgress.no.split('-')[1] : '---'}</p>
                  {inProgress && (
                    <button 
                      onClick={() => handleCallPatient(inProgress)}
                      className="w-12 h-12 bg-white/20 hover:bg-white/40 rounded-2xl flex items-center justify-center transition-all animate-pulse"
                      title="Panggil Ulang"
                    >
                      <Volume2 size={24} />
                    </button>
                  )}
                </div>
                <p className="text-xs font-bold mt-4 opacity-80 line-clamp-1">{inProgress ? inProgress.patientName : 'Tidak ada pasien'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sisa Antrian</span>
                  <span className="text-lg font-black text-gray-900">{waitingCount} Pasien</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Selesai</span>
                  <span className="text-lg font-black text-emerald-600">{finishedCount} Pasien</span>
                </div>
              </div>
              
              <button 
                disabled={waitingCount === 0 && !inProgress}
                onClick={handleCallNext}
                className="w-full bg-gray-900 text-white text-xs font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center space-x-2"
              >
                <Megaphone size={16} />
                <span>Panggil Antrian Berikutnya</span>
              </button>
            </div>
          </div>

          <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
            <h4 className="font-bold text-orange-900 mb-2">Sistem Suara</h4>
            <p className="text-xs text-orange-700 leading-relaxed mb-4">
              Pastikan volume speaker Anda aktif. Sistem akan mengumumkan nama pasien secara otomatis saat dipanggil.
            </p>
            <div className="flex items-center text-orange-600 font-bold text-[10px] uppercase tracking-widest">
              <Volume2 size={12} className="mr-1.5" />
              <span>Voice Ready (ID-id)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form Antrian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingQ ? 'Update Antrian' : 'Registrasi Antrian'}</h3>
                <p className="text-sm text-gray-500 mt-1">Daftarkan pasien ke antrian periksa hari ini.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">No. Antrian</label>
                  <input readOnly value={formData.no} className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl outline-none font-mono font-bold text-gray-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Waktu</label>
                  <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-800" />
                </div>
              </div>

              <div className="space-y-1 relative" ref={patientRef}>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pasien</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    required
                    type="text"
                    placeholder="Cari pasien..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setIsPatientDropdownOpen(true);
                      setFormData({...formData, patientName: '', patientId: ''});
                    }}
                    onFocus={() => setIsPatientDropdownOpen(true)}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                  />
                </div>
                {isPatientDropdownOpen && patientSearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPatientSearch(p.name);
                            setFormData({...formData, patientName: p.name, patientId: p.id});
                            setIsPatientDropdownOpen(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex flex-col"
                        >
                          <span className="font-bold text-gray-900">{p.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{p.rmNumber}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-center text-xs text-gray-400 italic">Pasien tidak ditemukan.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dokter</label>
                  <select 
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-800 appearance-none"
                  >
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ruangan</label>
                  <select 
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-800 appearance-none"
                  >
                    <option value="Poli Umum 1">Poli Umum 1</option>
                    <option value="Poli Umum 2">Poli Umum 2</option>
                    <option value="Poli Anak 1">Poli Anak 1</option>
                    <option value="Poli Anak 2">Poli Anak 2</option>
                    <option value="Poli Gigi">Poli Gigi</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">Batal</button>
                <button 
                  disabled={!formData.patientName}
                  type="submit" 
                  className={`flex-[2] py-4 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all ${
                    formData.patientName ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Check size={20} />
                  <span>{editingQ ? 'SIMPAN PERUBAHAN' : 'MASUKKAN ANTRIAN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Antrian */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertCircle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Batalkan Antrian?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Data antrian ini akan dihapus dari sistem hari ini.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tutup</button>
              <button 
                onClick={() => { if(qToDelete) onDelete(qToDelete); setIsDeleteModalOpen(false); }}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Hapus Antrian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
