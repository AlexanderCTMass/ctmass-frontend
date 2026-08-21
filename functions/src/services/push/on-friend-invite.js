import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import axios from "axios";
import { secrets } from "../../config/secrets.js";

// Reuses the same EmailJS account/template as the web app (src/libs/email-sender.js):
// service "default_service", generic template "template_epduqer" with params
// { subject, html, mail_to, from_name, from }. Server-side sends require the
// EmailJS Private Key (set as the EMAILJS_PRIVATE_KEY secret) and "Allow EmailJS
// API for non-browser applications" enabled in the EmailJS dashboard.
const EMAILJS_SERVICE_ID = "default_service";
const EMAILJS_TEMPLATE_ID = "template_epduqer";
const EMAILJS_PUBLIC_KEY = "as4ih3rGW3abw98dk";
const FROM_EMAIL = "support@ctmass.com";
const WEB_BASE = "https://ctmass.com";
const APP_STORE_URL = "https://apps.apple.com/app/ctmass";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ctmass.app";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildHtml = (inviterName, inviteUrl) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0C1420;">
    <h2 style="margin:0 0 8px;">${escapeHtml(inviterName)} invited you to CTMASS</h2>
    <p style="font-size:15px;line-height:1.6;color:#3b4757;">
      ${escapeHtml(inviterName)} wants to connect with you on CTMASS — the easiest way for homeowners
      and local specialists to find each other. Download the app and you'll automatically become friends.
    </p>
    <div style="margin:24px 0;">
      <a href="${APP_STORE_URL}" style="display:inline-block;background:#0C1420;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;margin:0 8px 8px 0;font-weight:700;">Download on the App Store</a>
      <a href="${PLAY_STORE_URL}" style="display:inline-block;background:#16B364;color:#04170D;text-decoration:none;padding:12px 20px;border-radius:10px;margin:0 8px 8px 0;font-weight:700;">Get it on Google Play</a>
    </div>
    <p style="font-size:13px;color:#66738a;">
      Or open <a href="${inviteUrl}" style="color:#16B364;">${inviteUrl}</a> on your phone.
    </p>
    <p style="font-size:12px;color:#9aa7b8;margin-top:24px;">Sent via CTMASS · support@ctmass.com</p>
  </div>
`;

// Sends the friend-invite email when a friendInvites doc is created. Email is
// best-effort: if EMAILJS_PRIVATE_KEY is not bound (e.g. on stage) it is skipped.
// The friendship itself is created client-side on the invitee's next sign-in.
export const onFriendInviteCreated = onDocumentCreated(
  {
    document: "friendInvites/{inviteId}",
    secrets: [secrets.emailjsPrivateKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const invite = event.data?.data() || {};
      const email = String(invite.email || "").trim();
      const inviterName = String(invite.inviterName || "A friend");
      const inviterId = String(invite.inviterId || "");
      if (!email) return;

      const privateKey = process.env.EMAILJS_PRIVATE_KEY;
      if (!privateKey) {
        logger.info(
          "onFriendInviteCreated: no EMAILJS_PRIVATE_KEY, skipping email",
        );
        return;
      }

      const inviteUrl = `${WEB_BASE}/app-invite?ref=${encodeURIComponent(inviterId)}`;

      await axios.post(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          accessToken: privateKey,
          template_params: {
            subject: `${inviterName} invited you to CTMASS`,
            html: buildHtml(inviterName, inviteUrl),
            mail_to: email,
            from_name: "CTMASS.com",
            from: FROM_EMAIL,
          },
        },
        { headers: { "content-type": "application/json" } },
      );

      logger.info("onFriendInviteCreated: invite email sent", { email });
    } catch (error) {
      logger.warn("onFriendInviteCreated: email failed", {
        error: error.response?.data || error.message,
      });
    }
  },
);
