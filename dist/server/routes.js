"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const otpStore_1 = require("../store/otpStore");
const ehrRegistry_1 = require("./ehrRegistry");
const router = express_1.default.Router();
router.post('/webhook/:ehrId', async (req, res) => {
    const ehrId = req.params.ehrId;
    if (!(0, ehrRegistry_1.isRegisteredEHR)(ehrId))
        return res.status(404).send('Unknown EHR');
    const body = req.body;
    const otp = body.otp;
    if (!otp)
        return res.status(400).send('Invalid payload');
    const from = req.body.From || 'unknown';
    const to = req.body.To || 'unknown';
    const expiresIn = parseInt(req.body.expiresIn || '300');
    const tokenId = await (0, otpStore_1.storeOtp)(ehrId, { otp, from, to, rawBody: body, expiresIn });
    res.json({ success: true, tokenId });
});
router.get('/otp/:ehrId', async (req, res) => {
    const ehrId = req.params.ehrId;
    const status = req.query.status || 'unread';
    const data = await (0, otpStore_1.getAllOtps)(ehrId, status);
    res.json(data);
});
router.get('/otp/:ehrId/:tokenId', async (req, res) => {
    const { ehrId, tokenId } = req.params;
    const otp = await (0, otpStore_1.peekOtp)(ehrId, tokenId);
    if (!otp)
        return res.status(404).send('Not found');
    res.json({ tokenId: otp.tokenId, otp: otp.otp });
});
router.post('/ehr', (req, res) => {
    const { ehrId, phoneNumber } = req.body;
    const success = (0, ehrRegistry_1.registerEHR)(ehrId, phoneNumber);
    if (!success)
        return res.status(400).send('Invalid input');
    res.json({ success: true });
});
exports.default = router;
