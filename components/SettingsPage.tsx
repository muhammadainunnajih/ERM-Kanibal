
import React, { useState, useRef } from 'react';
import { 
  Settings, Bell, Shield, Database, Smartphone, Globe, 
  Check, Save, RefreshCw, Lock, Trash2, Mail, 
  Phone, Languages, Palette, AlertTriangle, ShieldAlert,
  Upload, Download, X, Camera, FileSpreadsheet
} from 'lucide-react';
import { ClinicSettings } from '../types';

interface SettingsPageProps {
  settings: ClinicSettings;
  onUpdate: (settings: ClinicSettings) => void;
  onBackup: () => void;
  onRestore: (data: any) => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
  onWipeData: () => void;
}

type TabKey = 'umum' | 'notifikasi' | 'keamanan' | 'data' | 'tampilan';

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  settings, onUpdate, onBackup, onRestore, onExportExcel, onImportExcel, onWipeData 
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  
  const restoreFileRef = useRef<HTMLInputElement>(null);
  const excelFileRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('Menyimpan...');
    setTimeout(() => {
      setSaveStatus('Berhasil disimpan!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const updateSetting = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const updateNestedSetting = <K extends keyof ClinicSettings>(
    parentKey: K,
    childKey: string,
    value: any
  ) => {
    onUpdate({
      ...settings,
      [parentKey]: {
        ...(settings[parentKey] as any),
        [childKey]: value,
      },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onRestore(json);
        } catch (err) {
          alert('File tidak valid. Pastikan mengunggah file backup .json yang benar.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExcelImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        onImportExcel(file);
    }
  };

  const handleUpdateSecurity = () => {
    setSecuritySuccess(true);
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'umum':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Profil Klinik Utama</h3>
            
            <div className="flex flex-col items-center space-y-3 mb-8">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-32 h-32 rounded-[40px] bg-gray-50 border-4 border-gray-100 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer relative group transition-all hover:scale-105"
              >
                {settings.logo ? (
                  <img src={settings.logo} alt="Clinic Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-black uppercase tracking-widest text-center">Ubah<br/>Logo</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Logo Klinik</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Klinik</label>
                <input 
                  type="text" 
                  value={settings.name} 
                  onChange={(e) => updateSetting('name', e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={settings.website} 
                    onChange={(e) => updateSetting('website', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Kontak</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={settings.email} 
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={settings.phone} 
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Klinik</label>
              <textarea 
                rows={3} 
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all" 
              />
            </div>
          </div>
        );
      case 'notifikasi':
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Pengaturan Notifikasi</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Pasien', desc: 'Kirim pengingat jadwal & invoice via email.', icon: Mail },
                { key: 'whatsapp', label: 'WhatsApp Bisnis', desc: 'Notifikasi antrian & konfirmasi resep otomatis.', icon: Smartphone },
                { key: 'sms', label: 'Pesan SMS', desc: 'Gunakan sebagai cadangan jika internet pasien mati.', icon: Phone },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateNestedSetting('notifications', item.key, !(settings.notifications as any)[item.key])}
                    className={`w-14 h-8 rounded-full relative transition-colors ${
                      (settings.notifications as any)[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${
                      (settings.notifications as any)[item.key] ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'keamanan':
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Keamanan & Akses</h3>
            <div className={`p-6 rounded-3xl border transition-all flex items-start space-x-4 ${
              settings.maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                settings.maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400 shadow-sm'
              }`}>
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1">
                <h4 className={`font-black text-sm uppercase tracking-tight ${settings.maintenanceMode ? 'text-red-900' : 'text-gray-900'}`}>
                  Mode Pemeliharaan (Maintenance)
                </h4>
                <p className={`text-xs mt-1 mb-4 leading-relaxed ${settings.maintenanceMode ? 'text-red-700' : 'text-gray-500'}`}>
                  Saat diaktifkan, akses sistem akan dibatasi hanya untuk Administrator guna keperluan pembaruan data penting.
                </p>
                <button 
                  onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    settings.maintenanceMode ? 'bg-red-600 text-white shadow-xl shadow-red-100' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.maintenanceMode ? 'NONAKTIFKAN MAINTENANCE' : 'AKTIFKAN MAINTENANCE'}
                </button>
              </div>
            </div>
            
            <div className="space-y-6 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Update Kredensial Administrator</h4>
                {securitySuccess && (
                  <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center animate-in fade-in">
                    <Check size={12} className="mr-1" /> Kredensial Berhasil Diperbarui
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Sekarang</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input type="password" placeholder="Masukkan password baru" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" />
                </div>
              </div>
              <button 
                onClick={handleUpdateSecurity}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
              >
                Update Kredensial
              </button>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Data & Pencadangan</h3>
            
            {/* JSON Backup & Restore */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-blue-600 rounded-[28px] flex items-center justify-center shadow-sm">
                  <Download size={32} />
                </div>
                <div>
                  <h4 className="font-black text-blue-900 text-lg">Export JSON</h4>
                  <p className="text-xs text-blue-700 mt-1">Backup database sistem lengkap dalam format .JSON.</p>
                </div>
                <button 
                  onClick={onBackup}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  Backup JSON
                </button>
              </div>

              <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-emerald-600 rounded-[28px] flex items-center justify-center shadow-sm">
                  <Upload size={32} />
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 text-lg">Import JSON</h4>
                  <p className="text-xs text-emerald-700 mt-1">Restore data sistem dari file backup JSON.</p>
                </div>
                <input 
                  type="file" 
                  ref={restoreFileRef} 
                  onChange={handleFileRestore} 
                  accept=".json" 
                  className="hidden" 
                />
                <button 
                  onClick={() => restoreFileRef.current?.click()}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                >
                  Pilih File JSON
                </button>
              </div>
            </div>

            {/* Excel Backup & Restore */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-emerald-50/50 rounded-[40px] border border-emerald-200 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-emerald-700 rounded-[28px] flex items-center justify-center shadow-sm">
                  <FileSpreadsheet size={32} />
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 text-lg">Export ke Excel</h4>
                  <p className="text-xs text-emerald-700 mt-1">Unduh data per kategori ke dalam file Excel (.xlsx).</p>
                </div>
                <button 
                  onClick={onExportExcel}
                  className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-100"
                >
                  Ekspor Excel
                </button>
              </div>

              <div className="p-8 bg-green-50/30 rounded-[40px] border border-green-200 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-green-700 rounded-[28px] flex items-center justify-center shadow-sm">
                  <Upload size={32} />
                </div>
                <div>
                  <h4 className="font-black text-green-900 text-lg">Impor dari Excel</h4>
                  <p className="text-xs text-green-700 mt-1">Unggah data massal menggunakan template Excel.</p>
                </div>
                <input 
                  type="file" 
                  ref={excelFileRef} 
                  onChange={handleExcelImportClick} 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                />
                <button 
                  onClick={() => excelFileRef.current?.click()}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                >
                  Pilih File Excel
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="flex-1 pr-8">
                <h4 className="font-black text-red-600 text-sm uppercase tracking-tight">Factory Reset (Wipe All Data)</h4>
                <p className="text-xs text-gray-500 mt-1">Menghapus seluruh rekam medis dan transaksi. Akun Administrator tetap tersimpan.</p>
              </div>
              <button 
                onClick={() => setIsWipeModalOpen(true)}
                className="px-6 py-3 border-2 border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                Reset Data
              </button>
            </div>
          </div>
        );
      case 'tampilan':
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Preferensi Tampilan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                  <Palette size={14} className="mr-1.5" /> Tema Aplikasi
                </p>
                <div className="flex bg-gray-50 p-2 rounded-3xl border border-gray-100">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateNestedSetting('appearance', 'theme', theme)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        settings.appearance.theme === theme 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                  <Languages size={14} className="mr-1.5" /> Bahasa Sistem
                </p>
                <div className="flex bg-gray-50 p-2 rounded-3xl border border-gray-100">
                  {['Indonesia', 'English'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateNestedSetting('appearance', 'language', lang)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        settings.appearance.language === lang 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-3xl mt-8">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Pratinjau Font</h4>
              <p className="text-2xl font-black text-gray-900">Klinik Sehat EMR v2.5.0</p>
              <p className="text-sm text-gray-500 mt-2">The quick brown fox jumps over the lazy dog. 1234567890</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-gray-100 transition-transform hover:scale-105">
            <Settings size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pengaturan Sistem</h2>
            <p className="text-gray-500">Konfigurasi operasional dan preferensi aplikasi.</p>
          </div>
        </div>
        
        {saveStatus && (
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-right-2">
            <Check size={18} />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {[
            { key: 'umum', label: 'Profil Klinik', icon: Settings },
            { key: 'notifikasi', label: 'Notifikasi', icon: Bell },
            { key: 'keamanan', label: 'Keamanan', icon: Shield },
            { key: 'data', label: 'Data & Backup', icon: Database },
            { key: 'tampilan', label: 'Tampilan', icon: Palette },
          ].map((item) => (
            <button 
              key={item.key} 
              onClick={() => setActiveTab(item.key as TabKey)}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeTab === item.key 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100 translate-x-1' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} className={activeTab === item.key ? 'text-blue-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 flex flex-col h-full min-h-[600px] transition-all">
            <div className="flex-1">
              {renderTabContent()}
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <AlertTriangle size={14} className="mr-2 text-orange-400" />
                <span>Seluruh perubahan bersifat instan namun disarankan klik Simpan</span>
              </div>
              <button 
                onClick={() => handleSave()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                <Save size={18} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Wipe All Data */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Factory Reset?</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Tindakan ini akan menghapus seluruh data pasien, rekam medis, dan transaksi secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex p-6 bg-gray-50/50 space-x-4">
              <button 
                onClick={() => setIsWipeModalOpen(false)}
                className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Batal
              </button>
              <button 
                onClick={() => { onWipeData(); setIsWipeModalOpen(false); }}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                YA, HAPUS SEMUA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
