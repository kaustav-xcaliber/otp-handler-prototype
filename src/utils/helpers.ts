export const getRedisKey = (ehrId: string, tokenId: string) => `otp:${ehrId}:${tokenId}`;
export const maskOtp = (otp: string): string => '*'.repeat(otp.length);
