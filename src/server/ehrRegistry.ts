import { EHRConfig } from '../types';

const EHRs: Map<string, EHRConfig> = new Map();

export const registerEHR = (ehrId: string, phoneNumber: string): boolean => {
  if (!ehrId || !phoneNumber) return false;
  EHRs.set(ehrId, { phoneNumber });
  return true;
};

export const isRegisteredEHR = (ehrId: string): boolean => {
  return EHRs.has(ehrId);
};
