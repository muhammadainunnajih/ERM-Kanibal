
import React from 'react';

export type MenuKey = 
  | 'dashboard' 
  | 'data-pasien' 
  | 'data-dokter' 
  | 'apotek' 
  | 'kasir' 
  | 'jadwal' 
  | 'inventaris' 
  | 'laporan' 
  | 'manajemen-user' 
  | 'pengaturan';

export interface SyncMetadata {
  version: number;
  updatedAt: string;
  lastModifierId: string;
}

export interface ClinicSettings {
  name: string;
  logo?: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  notifications: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  appearance: {
    theme: 'Light' | 'Dark' | 'System';
    language: 'Indonesia' | 'English';
  };
  maintenanceMode: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'Administrator' | 'Dokter' | 'Perawat' | 'Apoteker' | 'Kasir';
  email: string;
  phone: string;
  status: 'Online' | 'Offline';
  lastActive: string;
  photo?: string;
}

export interface MedicalRecord extends SyncMetadata {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  doctorName: string;
}

export interface Patient extends SyncMetadata {
  id: string;
  name: string;
  rmNumber: string;
  birthDate: string;
  lastVisit: string;
  gender: 'L' | 'P';
  category: 'Umum' | 'BPJS';
  bpjsClass?: '1' | '2' | '3';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: 'Aktif' | 'Cuti';
  photo?: string;
}

export interface Medicine {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  category: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  status: 'Menunggu Antrian' | 'Diproses' | 'Siap Diambil';
  date: string;
  medicines: string;
}

export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  status: 'Lunas' | 'Pending';
  paymentMethod: 'Tunai' | 'Transfer' | 'QRIS';
}

export interface QueueItem {
  id: string;
  no: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: 'Menunggu' | 'Sedang Diperiksa' | 'Selesai';
  room: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
}
