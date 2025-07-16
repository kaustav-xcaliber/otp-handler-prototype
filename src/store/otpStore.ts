import { redis } from './redisClient';
import { getRedisKey, maskOtp } from '../utils/helpers';
import { OTPRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const storeOtp = async (ehrId: string, data: any): Promise<string> => {
  const tokenId = uuidv4();
  const receivedAt = new Date().toISOString();
  const expiresIn = data.expiresIn || 300;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const record: OTPRecord = {
    tokenId,
    ehrId,
    otp: data.otp,
    status: 'unread',
    from: data.from,
    to: data.to,
    receivedAt,
    expiresAt,
    rawBody: JSON.stringify(data.rawBody)
  };

  await redis.setEx(getRedisKey(ehrId, tokenId), 900, JSON.stringify(record));
  return tokenId;
};

export const getAllOtps = async (ehrId: string, statusFilter: 'all' | 'unread' = 'unread') => {
  const keys = await redis.keys(`otp:${ehrId}:*`);
  const otps = await Promise.all(keys.map(async key => {
    const val = await redis.get(key);
    return val ? JSON.parse(val) as OTPRecord : null;
  }));
  return otps
    .filter((o): o is OTPRecord => o !== null)
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .map((o) => ({ tokenId: o.tokenId, otp: maskOtp(o.otp) }));
};

export const peekOtp = async (ehrId: string, tokenId: string): Promise<OTPRecord | null> => {
  const key = getRedisKey(ehrId, tokenId);
  const raw = await redis.get(key);
  if (!raw) return null;
  const data: OTPRecord = JSON.parse(raw);
  data.status = 'read';
  await redis.setEx(key, 900, JSON.stringify(data));
  return data;
};
