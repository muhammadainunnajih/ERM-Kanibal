
import React, { useState, useRef } from 'react';
import { 
  Search, UserPlus, Pencil, Trash2, X, Check, 
  AlertCircle, Star, Briefcase, Activity, Camera, User
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorListProps {
  doctors: Doctor[];
  onAdd: (doctor: Doctor) => void;
  onUpdate: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}

const SPECIALTIES = [
  'Umum',
  'Penyakit Dalam',
  'Spesialis Anak',
  'Ortopedi',
  'Gizi Klinik',
  'Kandungan (Obgyn)',
  'Gigi',
  'Bedah Umum',
  'Mata',
  'THT'
];

export const DoctorList: React.FC<DoctorListProps> = ({ doctors, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: 'Umum',
    status: 'Aktif',
    photo: ''
  });

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(doctor);
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        specialty: 'Umum',
        status: 'Aktif',
        photo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      onUpdate({ ...editingDoctor, ...formData } as Doctor);
    } else {
      const newDoctor: Doctor = {
        ...formData,
        id: Date.now().toString(),
      } as Doctor;
      onAdd(newDoctor);
    }
    handleCloseModal();
  };

  const confirmDelete = (id: string) => {
    setDoctorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (doctorToDelete) {
      onDelete(doctorToDelete);
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Dokter</h2>
          <p className="text-gray-500">Total {doctors.length} tenaga medis terdaftar.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau spesialisasi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500 rounded-xl text-sm transition-all outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={20} />
            <span className="hidden sm:inline">Tambah Dokter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all relative overflow-hidden group animate-in fade-in zoom-in-95">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${doctor.status === 'Aktif' ? 'bg-emerald-500' : 'bg-orange-400'}`} />
            
            {/* Action Buttons Top Corner */}
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={() => handleOpenModal(doctor)}
                className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 shadow-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-50"
                title="Edit Dokter"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={() => confirmDelete(doctor.id)}
                className="p-2 bg-white/90 backdrop-blur-sm text-red-600 shadow-sm rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-50"
                title="Hapus Dokter"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center border-4 border-white shadow-inner overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                {doctor.photo ? (
                  <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-blue-200" />
                )}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 line-clamp-1 text-lg">{doctor.name}</h4>
                <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                  <Briefcase size={12} className="mr-1.5" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">{doctor.specialty}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-orange-400 pt-1">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                <span className="text-xs font-bold text-gray-400 ml-1">5.0</span>
              </div>

              <div className="w-full pt-4 flex items-center justify-between border-t border-gray-50 mt-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${doctor.status === 'Aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`} />
                  <span className={`text-[10px] font-black tracking-widest uppercase ${
                    doctor.status === 'Aktif' ? 'text-emerald-700' : 'text-orange-700'
                  }`}>
                    {doctor.status}
                  </span>
                </div>
                <button 
                   onClick={() => handleOpenModal(doctor)}
                   className="text-blue-600 text-xs font-bold hover:underline"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={32} />
            </div>
            <p className="text-gray-400 font-medium text-lg">Dokter tidak ditemukan.</p>
            <p className="text-sm text-gray-400">Coba gunakan kata kunci lain.</p>
          </div>
        )}
      </div>

      {/* Modal Form Dokter */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingDoctor ? 'Edit Data Dokter' : 'Registrasi Dokter Baru'}</h3>
                <p className="text-sm text-gray-500 mt-1">Kelola informasi tenaga medis profesional.</p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-[38px] bg-gray-50 border-4 border-gray-100 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer relative group"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Ubah Foto</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Klik untuk unggah foto</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                    placeholder="Contoh: dr. Nizar, Sp.PD"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Spesialisasi</label>
                    <select 
                      required
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 appearance-none"
                    >
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border-2 border-transparent">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'Aktif'})}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${
                          formData.status === 'Aktif' 
                            ? 'bg-white text-emerald-600 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        AKTIF
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'Cuti'})}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${
                          formData.status === 'Cuti' 
                            ? 'bg-white text-orange-500 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        CUTI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 font-black text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-2"
                >
                  <Check size={20} />
                  <span>{editingDoctor ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN DOKTER'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Dokter (Updated Style) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Hapus Dokter?</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Data profil dan jadwal dokter ini akan dihapus permanen dari sistem Klinik Sehat.
              </p>
            </div>
            <div className="flex p-6 bg-gray-50/50 space-x-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
