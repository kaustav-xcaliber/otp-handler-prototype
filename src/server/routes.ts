import express, { Request, Response } from "express";
import { storeOtp, getAllOtps, peekOtp } from "../store/otpStore";
import { registerEHR, isRegisteredEHR } from "./ehrRegistry";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("OTP Handler API is running");
});

router.post("/webhook/:ehrId", async (req: Request, res: Response) => {
  const ehrId = req.params.ehrId;

  if (!isRegisteredEHR(ehrId)) {
    return res.status(404).send("Unknown EHR");
  }

  const body = req.body;
  console.log(`Received SMS for EHR ${ehrId}:`, body);

  const rawMessage = body.Body || "";
  const otpMatch = rawMessage.match(/\b\d{4,8}\b/); // Extracts 4-8 digit OTP
  if (!otpMatch) {
    return res.status(400).send("No OTP found in message body");
  }

  const otp = otpMatch[0];
  const from = body.From || "unknown";
  const to = body.To || "unknown";

  // Twilio payloads do not contain expiration; default to 5 minutes
  const expiresIn = 300;

  const tokenId = await storeOtp(ehrId, {
    otp,
    from,
    to,
    rawBody: body,
    expiresIn,
  });

  console.log(`Stored OTP for ${ehrId} as token ID: ${tokenId}`);
  console.log(`OTP: ${otp}, From: ${from}, To: ${to}`);
  res.json({ success: true, tokenId });
});


router.get("/otp/:ehrId", async (req: Request, res: Response) => {
  const ehrId = req.params.ehrId;
  const status = (req.query.status as "all" | "unread") || "unread";
  const data = await getAllOtps(ehrId, status);
  res.json(data);
});

router.get("/otp/:ehrId/:tokenId", async (req: Request, res: Response) => {
  const { ehrId, tokenId } = req.params;
  const otp = await peekOtp(ehrId, tokenId);
  if (!otp) return res.status(404).send("Not found");
  res.json({ tokenId: otp.tokenId, otp: otp.otp });
});

router.post("/ehr", (req: Request, res: Response) => {
  const { ehrId, phoneNumber } = req.body;
  const success = registerEHR(ehrId, phoneNumber);
  if (!success) return res.status(400).send("Invalid input");
  res.json({ success: true, webHook: `/webhook/${ehrId}` });
});

export default router;
