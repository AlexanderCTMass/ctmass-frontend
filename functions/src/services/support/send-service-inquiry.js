import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import axios from "axios";
import { secrets } from "../../config/secrets.js";

// Sends an IT-services inquiry from the mobile app to support@ctmass.com via the
// same EmailJS account/template as the web app (service "default_service",
// generic template "template_epduqer" with { subject, html, mail_to, from_name,
// from }). Needs the EMAILJS_PRIVATE_KEY secret and "Allow EmailJS API for
// non-browser applications" enabled in the EmailJS dashboard.
const EMAILJS_SERVICE_ID = "default_service";
const EMAILJS_TEMPLATE_ID = "template_epduqer";
const EMAILJS_PUBLIC_KEY = "as4ih3rGW3abw98dk";
const SUPPORT_EMAIL = "support@ctmass.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildHtml = ({ services, message, replyTo, uid }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0C1420;">
    <h2 style="margin:0 0 8px;">New IT services inquiry</h2>
    <p style="font-size:14px;color:#3b4757;margin:0 0 16px;">Sent from the CTMASS mobile app.</p>
    <p style="font-size:15px;margin:0 0 6px;"><strong>Reply to:</strong> ${escapeHtml(replyTo)}</p>
    <p style="font-size:15px;margin:0 0 12px;"><strong>Services of interest:</strong><br/>${
      services.length ? escapeHtml(services.join(", ")) : "—"
    }</p>
    <p style="font-size:15px;margin:0 0 6px;"><strong>Message:</strong></p>
    <div style="font-size:15px;line-height:1.6;color:#0C1420;white-space:pre-wrap;border-left:3px solid #16B364;padding:4px 12px;background:#f6f9f7;">${
      message ? escapeHtml(message) : "—"
    }</div>
    <p style="font-size:12px;color:#9aa7b8;margin-top:24px;">User: ${escapeHtml(
      uid || "guest",
    )} · Sent via CTMASS app · support@ctmass.com</p>
  </div>
`;

export const sendServiceInquiry = onCall(
  {
    secrets: [secrets.emailjsPrivateKey],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (request) => {
    const data = request.data || {};
    const services = Array.isArray(data.services)
      ? data.services
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const message = String(data.message || "").trim().slice(0, 4000);
    const replyTo = String(data.email || "").trim().slice(0, 200);
    const uid = request.auth?.uid || null;

    if (!EMAIL_RE.test(replyTo)) {
      throw new HttpsError(
        "invalid-argument",
        "Please provide a valid email so we can reply.",
      );
    }
    if (services.length === 0 && !message) {
      throw new HttpsError(
        "invalid-argument",
        "Please choose a service or add a message.",
      );
    }

    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    if (!privateKey) {
      throw new HttpsError(
        "failed-precondition",
        "Email service is not configured yet.",
      );
    }

    try {
      await axios.post(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          accessToken: privateKey,
          template_params: {
            subject: `IT services inquiry from ${replyTo}`,
            html: buildHtml({ services, message, replyTo, uid }),
            mail_to: SUPPORT_EMAIL,
            from_name: "CTMASS App",
            from: SUPPORT_EMAIL,
          },
        },
        { headers: { "content-type": "application/json" } },
      );
      logger.info("sendServiceInquiry: sent", {
        uid,
        services: services.length,
      });
      return { success: true };
    } catch (error) {
      logger.error("sendServiceInquiry: failed", {
        error: error.response?.data || error.message,
      });
      throw new HttpsError(
        "internal",
        "We couldn't send your message. Please try again.",
      );
    }
  },
);
