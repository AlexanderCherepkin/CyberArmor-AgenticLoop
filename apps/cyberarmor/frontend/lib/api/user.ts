import { apiFetchJson } from './client';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  locale: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  company_name?: string | null;
  locale?: string | null;
  timezone?: string | null;
}

export interface UserDevice {
  id: string;
  user_id: string;
  serial_number_masked: string | null;
  name: string | null;
  product_variant: string | null;
  firmware_version: string | null;
  is_active: boolean;
  is_revoked: boolean;
  activated_at: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDeviceCreate {
  serial_number: string;
  name?: string | null;
  product_variant?: string | null;
}

export interface UserDeviceUpdate {
  name?: string | null;
  firmware_version?: string | null;
}

export interface InstallerDownload {
  platform: string;
  version: string;
  filename: string;
  checksum_sha256: string;
  size_bytes: number;
  download_url: string;
  signature_url: string | null;
}

export const userApi = {
  getProfile: () => apiFetchJson<UserProfile>('/users/me/profile'),
  updateProfile: (payload: UserProfileUpdate) =>
    apiFetchJson<UserProfile>('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getDevices: () => apiFetchJson<UserDevice[]>('/users/me/devices'),
  registerDevice: (payload: UserDeviceCreate) =>
    apiFetchJson<UserDevice>('/users/me/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateDevice: (deviceId: string, payload: UserDeviceUpdate) =>
    apiFetchJson<UserDevice>(`/users/me/devices/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  revokeDevice: (deviceId: string) =>
    apiFetchJson<never>(`/users/me/devices/${deviceId}`, { method: 'DELETE' }),
  getDownloads: () => apiFetchJson<InstallerDownload[]>('/users/me/downloads'),
};
