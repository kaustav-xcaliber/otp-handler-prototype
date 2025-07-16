"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegisteredEHR = exports.registerEHR = void 0;
const EHRs = new Map();
const registerEHR = (ehrId, phoneNumber) => {
    if (!ehrId || !phoneNumber)
        return false;
    EHRs.set(ehrId, { phoneNumber });
    return true;
};
exports.registerEHR = registerEHR;
const isRegisteredEHR = (ehrId) => {
    return EHRs.has(ehrId);
};
exports.isRegisteredEHR = isRegisteredEHR;
