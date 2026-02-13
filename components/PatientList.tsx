
import React, { useState } from 'react';
import { 
  Search, UserPlus, Pencil, Trash2, X, Check, 
  AlertCircle, ClipboardList, ArrowLeft, Plus, 
  Stethoscope, Calendar, User, Activity, CreditCard, ShieldCheck,
  FileText, History, CheckCircle2
} from 'lucide-react';
import { Patient, MedicalRecord } from '../types';

interface PatientListProps {
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  onAdd: (patient: Patient, initialRecord?: Partial<MedicalRecord>) => void;
  onUpdate: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onAddRecord: (record: MedicalRecord) => void;
  onUpdateRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  patients, medicalRecords, onAdd, onUpdate, onDelete, 
  onAddRecord, onUpdateRecord, onDeleteRecord 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'records'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false);

  // States for Editing/Deleting
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  // Patient Form State (Extended with initial record fields)
  const [formData, setFormData] = useState<any>({
    name: '', rmNumber: '', gender: 'L', birthDate: '', 
    lastVisit: new Date().toISOString().split('T')[0],
    category: 'Umum',
    // Initial Record fields
    includeRecord: false,
    symptoms: '',
    diagnosis: '',
    treatment: '',
    doctorName: 'dr. Andi Wijaya'
  });

  // Record Form State
  const [recordFormData, setRecordFormData] = useState<Partial<MedicalRecord>>({
    date: new Date().toISOString().split('T')[0],
    symptoms: '', diagnosis: '', treatment: '', doctorName: 'dr. Andi Wijaya'
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.rmNumber.includes(searchTerm)
  );

  const handleOpenPatientModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        ...patient,
        includeRecord: false,
        symptoms: '',
        diagnosis: '',
        treatment: '',
        doctorName: 'dr. Andi Wijaya'
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        rmNumber: `RM${Date.now()}`,
        gender: 'L',
        birthDate: '',
        lastVisit: new Date().toISOString().split('T')[0],
        category: 'Umum',
        includeRecord: false,
        symptoms: '',
        diagnosis: '',
        treatment: '',
        doctorName: 'dr. Andi Wijaya'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenRecordModal = (record?: MedicalRecord) => {
    if (record) {
      setEditingRecord(record);
      setRecordFormData(record);
    } else {
      setEditingRecord(null);
      setRecordFormData({
        date: new Date().toISOString().split('T')[0],
        symptoms: '', diagnosis: '', treatment: '', doctorName: 'dr. Andi Wijaya'
      });
    }
    setIsRecordModalOpen(true);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      onUpdate({ ...editingPatient, ...formData } as Patient);
    } else {
      const patientId = Date.now().toString();
      const newPatient = { 
        id: patientId,
        name: formData.name,
        rmNumber: formData.rmNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        lastVisit: formData.lastVisit,
        category: formData.category,
        bpjsClass: formData.bpjsClass
      } as Patient;

      let initialRecord: Partial<MedicalRecord> | undefined = undefined;
      if (formData.includeRecord) {
        initialRecord = {
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          doctorName: formData.doctorName
        };
      }

      onAdd(newPatient, initialRecord);
    }
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (editingRecord) {
      onUpdateRecord({ ...editingRecord, ...recordFormData } as MedicalRecord);
    } else {
      const newRecord = { 
        ...recordFormData, 
        id: `REC-${Date.now()}`, 
        patientId: selectedPatient.id 
      } as MedicalRecord;
      onAddRecord(newRecord);
    }
    setIsRecordModalOpen(false);
    setEditingRecord(null);
  };

  const patientRecords = selectedPatient 
    ? medicalRecords.filter(r => r.patientId === selectedPatient.id)
    : [];

  if (viewMode === 'records' && selectedPatient) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => { setViewMode('list'); setSelectedPatient(null); }}
              className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Rekam Medis: {selectedPatient.name}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-gray-500 text-sm">No. RM: {selectedPatient.rmNumber} • </p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedPatient.category === 'BPJS' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedPatient.category} {selectedPatient.category === 'BPJS' && `- Kelas ${selectedPatient.bpjsClass}`}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => handleOpenRecordModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus size={20} />
            <span>Tambah Catatan Medis</span>
          </button>
        </div>

        <div className="space-y-4">
          {patientRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Belum ada riwayat rekam medis untuk pasien ini.</p>
              <button 
                onClick={() => handleOpenRecordModal()}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                Buat Catatan Pertama
              </button>
            </div>
          ) : (
            patientRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{record.date}</p>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{record.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenRecordModal(record)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => { setRecordToDelete(record.id); setIsDeleteRecordModalOpen(true); }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keluhan</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{record.symptoms}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Diagnosa</p>
                    <p className="text-sm font-bold text-gray-900">{record.diagnosis}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tindakan/Resep</p>
                    <p className="text-sm text-gray-700 italic">"{record.treatment}"</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Record Form (Internal context) */}
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{editingRecord ? 'Edit Catatan Medis' : 'Catat Pemeriksaan Baru'}</h3>
                  <p className="text-xs text-gray-500 mt-1">Input hasil diagnosa dan tindakan dokter.</p>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleRecordSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Tanggal</label>
                    <input required type="date" value={recordFormData.date} onChange={e => setRecordFormData({...recordFormData, date: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Dokter</label>
                    <input required type="text" value={recordFormData.doctorName} onChange={e => setRecordFormData({...recordFormData, doctorName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Keluhan Pasien</label>
                  <textarea required rows={2} value={recordFormData.symptoms} onChange={e => setRecordFormData({...recordFormData, symptoms: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Diagnosa</label>
                  <input required type="text" value={recordFormData.diagnosis} onChange={e => setRecordFormData({...recordFormData, diagnosis: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Tindakan / Resep</label>
                  <textarea required rows={2} value={recordFormData.treatment} onChange={e => setRecordFormData({...recordFormData, treatment: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setIsRecordModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100">Simpan Catatan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Record Modal */}
        {isDeleteRecordModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Catatan?</h3>
              <p className="text-sm text-gray-500 mb-6">Data riwayat medis ini akan hilang permanen.</p>
              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteRecordModalOpen(false)} className="flex-1 font-bold text-gray-400">Batal</button>
                <button 
                  onClick={() => { if(recordToDelete) onDeleteRecord(recordToDelete); setIsDeleteRecordModalOpen(false); }} 
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Standard Patient List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Pasien</h2>
          <p className="text-gray-500">Total {patients.length} pasien terdaftar di sistem.</p>
        </div>
        <button 
          onClick={() => handleOpenPatientModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus size={20} />
          <span>Tambah Pasien</span>
        </button>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau No. RM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm transition-all outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
            <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
              <Check size={12} />
              <span>Sistem Aktif</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Pasien</th>
                <th className="px-6 py-4">No. RM</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Tgl Lahir</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{patient.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Kunjungan: {patient.lastVisit}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{patient.rmNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black text-center w-fit uppercase tracking-widest ${patient.category === 'BPJS' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {patient.category}
                      </span>
                      {patient.category === 'BPJS' && (
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Kelas {patient.bpjsClass}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${patient.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {patient.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{patient.birthDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => { setSelectedPatient(patient); setViewMode('records'); }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Rekam Medis"
                      >
                        <Stethoscope size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenPatientModal(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
                        title="Edit Profil"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => { setPatientToDelete(patient.id); setIsDeleteModalOpen(true); }}
                        className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition-all"
                        title="Hapus Pasien"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Modals (NOW WITH INTEGRATED MEDICAL RECORD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingPatient ? 'Edit Data Pasien' : 'Registrasi Pasien Baru'}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Lengkapi profil pasien{!editingPatient && ' dan catatan medis awal'}.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handlePatientSubmit} className="p-8 space-y-8">
              {/* Section 1: Profil Pasien */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <User size={18} />
                  <h4 className="text-xs font-black uppercase tracking-[.2em]">Data Profil Pasien</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-800" placeholder="Subarjo Ahmad" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. RM (Otomatis)</label>
                    <input readOnly value={formData.rmNumber} className="w-full px-5 py-3 bg-gray-100 border-none rounded-2xl text-gray-500 font-mono text-xs cursor-not-allowed" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Layanan</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                      <button type="button" onClick={() => setFormData({...formData, category: 'Umum'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.category === 'Umum' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Umum</button>
                      <button type="button" onClick={() => setFormData({...formData, category: 'BPJS', bpjsClass: formData.bpjsClass || '1'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.category === 'BPJS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400'}`}>BPJS</button>
                    </div>
                  </div>
                  {formData.category === 'BPJS' && (
                    <div className="space-y-1 animate-in zoom-in-95">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas BPJS</label>
                      <select value={formData.bpjsClass} onChange={e => setFormData({...formData, bpjsClass: e.target.value as any})} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 appearance-none">
                        <option value="1">Kelas 1</option>
                        <option value="2">Kelas 2</option>
                        <option value="3">Kelas 3</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 appearance-none">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tgl Kunjungan</label>
                    <input type="date" value={formData.lastVisit} onChange={e => setFormData({...formData, lastVisit: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-800" />
                  </div>
                </div>
              </div>

              {/* Section 2: Pemeriksaan Medis Awal (Hanya untuk pasien baru) */}
              {!editingPatient && (
                <div className="pt-6 border-t-2 border-dashed border-gray-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <Stethoscope size={18} />
                      <h4 className="text-xs font-black uppercase tracking-[.2em]">Pemeriksaan Medis Awal</h4>
                    </div>
                    <label className="flex items-center cursor-pointer group">
                      <span className="text-[10px] font-black uppercase text-gray-400 mr-3 group-hover:text-blue-500 transition-colors">Input Rekam Medis Sekarang?</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={formData.includeRecord} onChange={e => setFormData({...formData, includeRecord: e.target.checked})} />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.includeRecord ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.includeRecord ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                  </div>

                  {formData.includeRecord && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dokter Pemeriksa</label>
                          <input required={formData.includeRecord} type="text" value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} className="w-full px-5 py-3 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-900" placeholder="dr. Andi Wijaya" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Diagnosa Awal</label>
                          <input required={formData.includeRecord} type="text" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full px-5 py-3 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-900" placeholder="Influenza / Observasi Febris" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keluhan Pasien (Symptoms)</label>
                        <textarea required={formData.includeRecord} rows={2} value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="w-full px-5 py-3 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Demam tinggi sejak kemarin sore, pusing..." />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tindakan / Resep Obat</label>
                        <textarea required={formData.includeRecord} rows={2} value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} className="w-full px-5 py-3 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Paracetamol 500mg (3x1), Istirahat total..." />
                      </div>
                      
                      <div className="bg-emerald-50 p-4 rounded-2xl flex items-start space-x-3 border border-emerald-100">
                        <CheckCircle2 className="text-emerald-600 mt-0.5" size={16} />
                        <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-tight leading-relaxed">
                          Rekam medis ini akan otomatis tersimpan dalam riwayat medis pasien setelah tombol simpan diklik.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-xs text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[.25em] rounded-2xl shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center space-x-3">
                  <Save size={18} />
                  <span>{editingPatient ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN PASIEN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Patient Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pasien?</h3>
            <p className="text-sm text-gray-500 mb-6">Tindakan ini juga akan menghapus seluruh riwayat rekam medis pasien ini secara permanen.</p>
            <div className="flex space-x-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 font-bold text-gray-400 uppercase text-xs">Batal</button>
              <button 
                onClick={() => { if(patientToDelete) onDelete(patientToDelete); setIsDeleteModalOpen(false); }} 
                className="flex-[1.5] py-3 bg-red-600 text-white font-black rounded-xl uppercase text-xs tracking-widest"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon for consistency
const Save = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
