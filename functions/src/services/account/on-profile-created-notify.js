import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";
import { secrets } from "../../config/secrets.js";

const EMAILJS_SERVICE_ID = "default_service";
const EMAILJS_TEMPLATE_ID = "template_epduqer";
const EMAILJS_PUBLIC_KEY = "as4ih3rGW3abw98dk";
const ADMIN_EMAIL = "support@ctmass.com";
const PRODUCTION_PROJECT_ID = "ctmass-8f048";

const PLATFORM_LABELS = {
  ios: "iOS app",
  android: "Android app",
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const currentProjectId = () =>
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  getApp().options.projectId ||
  "";

const row = (label, value, bold = false) => `
      <tr><td style="padding: 6px 0; color: #666; width: 120px; vertical-align: top;">${label}:</td><td style="padding: 6px 0;${bold ? " font-weight: 600;" : ""}">${value}</td></tr>`;

const describeInviter = (inviter) => {
  if (!inviter) return "";
  const name = inviter.businessName || inviter.name || "";
  const email = inviter.email || "";
  if (name && email && name !== email) return `${name} (${email})`;
  return name || email;
};

const describeChannel = (profile, inviter) => {
  const who = describeInviter(inviter);
  if (profile.invitedVia === "profile_link") {
    return who
      ? `QR code / profile link shared by ${who}`
      : "QR code / profile link";
  }
  if (profile.invitedVia === "email_invite") {
    return who ? `Email invite from ${who}` : "Email invite";
  }
  return "Downloaded from App Store / Google Play (no invite)";
};

const buildHtml = (profile, inviter) => {
  const platform = PLATFORM_LABELS[profile.platform] || "Mobile app";
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1F2D77; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 20px;">🎉 New Registration</h2>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <h3 style="margin: 0 0 16px; color: #1F2D77;">User Info</h3>
    <table style="width: 100%; border-collapse: collapse;">${row("Name", escapeHtml(profile.name || "—"), true)}${row("Email", escapeHtml(profile.email || "—"), true)}${row("Role", escapeHtml(profile.role || "—"))}${row("Phone", escapeHtml(profile.phone || "—"))}${row("Registered via", `📱 ${escapeHtml(platform)}`, true)}${row("Came from", escapeHtml(describeChannel(profile, inviter)), true)}
    </table>
  </div>
</div>`.trim();
};

export const onProfileCreatedAdminNotify = onDocumentCreated(
  {
    document: "profiles/{userId}",
    secrets: [secrets.emailjsPrivateKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    const profile = event.data?.data() || {};
    if (profile.source !== "mobile") return;

    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    if (!privateKey || currentProjectId() !== PRODUCTION_PROJECT_ID) {
      logger.info("onProfileCreatedAdminNotify: email skipped", {
        userId: event.params.userId,
      });
      return;
    }

    let inviter = null;
    if (profile.invitedBy) {
      try {
        const snap = await getFirestore()
          .collection("profiles")
          .doc(String(profile.invitedBy))
          .get();
        inviter = snap.exists ? snap.data() : null;
      } catch (error) {
        logger.warn("onProfileCreatedAdminNotify: inviter lookup failed", {
          error: error?.message,
        });
      }
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
            subject: "New registration (mobile app)",
            html: buildHtml(profile, inviter),
            mail_to: ADMIN_EMAIL,
            from_name: "CTMASS.com",
            from: ADMIN_EMAIL,
          },
        },
        { headers: { "content-type": "application/json" } },
      );
      logger.info("onProfileCreatedAdminNotify: sent", {
        userId: event.params.userId,
      });
    } catch (error) {
      logger.warn("onProfileCreatedAdminNotify: email failed", {
        userId: event.params.userId,
        error: error?.response?.data || error?.message,
      });
    }
  },
);
