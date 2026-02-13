
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { DoctorList } from './components/DoctorList';
import { Pharmacy } from './components/Pharmacy';
import { Cashier } from './components/Cashier';
import { Schedule } from './components/Schedule';
import { Inventory } from './components/Inventory';
import { Reports } from './components/Reports';
import { UserManagement } from './components/UserManagement';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import { MenuKey, Patient, MedicalRecord, Doctor, Prescription, Medicine, Invoice, QueueItem, StaffUser, ClinicSettings } from './types';
import { X, MessageCircle, Mail, Phone, ExternalLink, ShieldCheck, Headphones, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

const INITIAL_SETTINGS: ClinicSettings = {
  name: 'Klinik Sehat Utama',
  logo: '',
  website: 'www.kliniksehat.com',
  address: 'Jl. Raya Kemerdekaan No. 45, Jakarta Pusat, DKI Jakarta',
  phone: '08123456789',
  email: 'info@kliniksehat.com',
  notifications: { email: true, whatsapp: true, sms: false },
  appearance: { theme: 'Light', language: 'Indonesia' },
  maintenanceMode: false,
};

const INITIAL_USERS: StaffUser[] = [
  { id: 'u0', name: 'Super Administrator', username: 'admin', password: 'admin123', role: 'Administrator', email: 'admin@kliniksehat.com', phone: '08123456789', status: 'Online', lastActive: 'Sekarang', photo: 'https://i.pravatar.cc/150?u=admin' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [users, setUsers] = useState<StaffUser[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<ClinicSettings>(INITIAL_SETTINGS);

  // SIMULATOR: Simulasi sinkronisasi background (Real-time listener)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulasi mendeteksi perubahan dari "device lain" setiap 30 detik
    const syncInterval = setInterval(() => {
      if (currentUser) {
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('online'), 1500);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(syncInterval);
    };
  }, [currentUser]);

  // Handler CRUD dengan Metadata Sinkronisasi
  const handleAddPatient = (newPatient: Patient, initialRecord?: Partial<MedicalRecord>) => {
    const timestamp = new Date().toISOString();
    const patientWithMeta: Patient = {
      ...newPatient,
      version: 1,
      updatedAt: timestamp,
      lastModifierId: currentUser?.id || 'system'
    };

    setPatients(prev => [patientWithMeta, ...prev]);
    
    if (initialRecord && initialRecord.symptoms) {
      const record: MedicalRecord = {
        ...initialRecord,
        id: `REC-${Date.now()}`,
        patientId: newPatient.id,
        date: new Date().toISOString().split('T')[0],
        doctorName: initialRecord.doctorName || 'dr. Umum',
        version: 1,
        updatedAt: timestamp,
        lastModifierId: currentUser?.id || 'system'
      } as MedicalRecord;
      setMedicalRecords(prev => [record, ...prev]);
    }
  };

  const handleUpdatePatient = useCallback((updatedPatient: Patient) => {
    setSyncStatus('syncing');
    // Simulasi API call
    setTimeout(() => {
      setPatients(prev => prev.map(p => 
        p.id === updatedPatient.id 
          ? { ...updatedPatient, version: p.version + 1, updatedAt: new Date().toISOString() } 
          : p
      ));
      setSyncStatus('online');
    }, 500);
  }, []);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} clinicName={settings.name} registeredUsers={users} />;

  return (
    <div className={`flex h-screen overflow-hidden ${settings.appearance.theme === 'Dark' ? 'dark bg-gray-900 text-white' : ''}`}>
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuClick={setActiveMenu} 
        clinicName={settings.name} 
        clinicLogo={settings.logo} 
        userRole={currentUser.role}
        onContactClick={() => setIsSupportOpen(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentTime={currentTime} onLogout={() => setCurrentUser(null)} currentUser={currentUser} />
        
        {/* Real-time Sync Status Bar */}
        <div className={`px-8 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest border-b ${
          syncStatus === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          syncStatus === 'syncing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
          'bg-red-50 text-red-600 border-red-100'
        }`}>
          <div className="flex items-center space-x-2">
            {syncStatus === 'online' ? <Wifi size={12} /> : syncStatus === 'syncing' ? <RefreshCw size={12} className="animate-spin" /> : <WifiOff size={12} />}
            <span>Sesi Aktif: Multi-Device Sync {syncStatus}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>ID Sesi: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            <span>Versi Data: v2.5.4</span>
          </div>
        </div>

        <main className={`flex-1 overflow-y-auto p-8 ${settings.appearance.theme === 'Dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto">
            {activeMenu === 'dashboard' && <Dashboard patients={patients} onAddPatient={() => setActiveMenu('data-pasien')} clinicName={settings.name} clinicLogo={settings.logo} />}
            {activeMenu === 'data-pasien' && (
              <PatientList 
                patients={patients} medicalRecords={medicalRecords}
                onAdd={handleAddPatient} onUpdate={handleUpdatePatient} onDelete={(id) => setPatients(prev => prev.filter(p => p.id !== id))}
                onAddRecord={(r) => setMedicalRecords(prev => [r, ...prev])} 
                onUpdateRecord={(r) => setMedicalRecords(prev => prev.map(rc => rc.id === r.id ? r : rc))} 
                onDeleteRecord={(id) => setMedicalRecords(prev => prev.filter(r => r.id !== id))}
              />
            )}
            {/* ... component lainnya ... */}
            {activeMenu === 'data-dokter' && <DoctorList doctors={doctors} onAdd={(d) => setDoctors(prev => [d, ...prev])} onUpdate={(d) => setDoctors(prev => prev.map(dr => dr.id === d.id ? d : dr))} onDelete={(id) => setDoctors(prev => prev.filter(d => d.id !== id))} />}
            {activeMenu === 'apotek' && <Pharmacy prescriptions={prescriptions} patients={patients} doctors={doctors} medicines={medicines} onAdd={(r) => setPrescriptions(prev => [r, ...prev])} onUpdate={(r) => setPrescriptions(prev => prev.map(rx => rx.id === r.id ? r : rx))} onDelete={(id) => setPrescriptions(prev => prev.filter(r => r.id !== id))} onAddMedicine={(m) => setMedicines(prev => [m, ...prev])} onUpdateMedicine={(m) => setMedicines(prev => prev.map(md => md.id === m.id ? m : md))} onDeleteMedicine={(id) => setMedicines(prev => prev.filter(m => m.id !== id))} />}
          </div>
        </main>
      </div>

      {/* Support Center Modal ... (tetap sama) */}
    </div>
  );
};

export default App;
