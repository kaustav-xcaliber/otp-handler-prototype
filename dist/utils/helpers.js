"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskOtp = exports.getRedisKey = void 0;
const getRedisKey = (ehrId, tokenId) => `otp:${ehrId}:${tokenId}`;
exports.getRedisKey = getRedisKey;
const maskOtp = (otp) => '*'.repeat(otp.length);
exports.maskOtp = maskOtp;
