export interface OTPRecord {
  tokenId: string;
  ehrId: string;
  otp: string;
  status: 'unread' | 'read' | 'expired';
  from: string;
  to: string;
  receivedAt: string;
  expiresAt: string;
  rawBody: string;
}

export interface EHRConfig {
  phoneNumber: string;
}
