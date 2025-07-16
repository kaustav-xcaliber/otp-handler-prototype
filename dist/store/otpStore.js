"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peekOtp = exports.getAllOtps = exports.storeOtp = void 0;
const redisClient_1 = require("./redisClient");
const helpers_1 = require("../utils/helpers");
const uuid_1 = require("uuid");
const storeOtp = async (ehrId, data) => {
    const tokenId = (0, uuid_1.v4)();
    const receivedAt = new Date().toISOString();
    const expiresIn = data.expiresIn || 300;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const record = {
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
    await redisClient_1.redis.setEx((0, helpers_1.getRedisKey)(ehrId, tokenId), 900, JSON.stringify(record));
    return tokenId;
};
exports.storeOtp = storeOtp;
const getAllOtps = async (ehrId, statusFilter = 'unread') => {
    const keys = await redisClient_1.redis.keys(`otp:${ehrId}:*`);
    const otps = await Promise.all(keys.map(async (key) => {
        const val = await redisClient_1.redis.get(key);
        return val ? JSON.parse(val) : null;
    }));
    return otps
        .filter((o) => o !== null)
        .filter((o) => statusFilter === "all" || o.status === statusFilter)
        .map((o) => ({ tokenId: o.tokenId, otp: (0, helpers_1.maskOtp)(o.otp) }));
};
exports.getAllOtps = getAllOtps;
const peekOtp = async (ehrId, tokenId) => {
    const key = (0, helpers_1.getRedisKey)(ehrId, tokenId);
    const raw = await redisClient_1.redis.get(key);
    if (!raw)
        return null;
    const data = JSON.parse(raw);
    data.status = 'read';
    await redisClient_1.redis.setEx(key, 900, JSON.stringify(data));
    return data;
};
exports.peekOtp = peekOtp;
