import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";
import { secrets } from "../../config/secrets.js";
import { appendAppNotification } from "../push/app-notifications.js";

const EMAILJS_SERVICE_ID = "default_service";
const EMAILJS_TEMPLATE_ID = "template_epduqer";
const EMAILJS_PUBLIC_KEY = "as4ih3rGW3abw98dk";
const SUPPORT_EMAIL = "support@ctmass.com";
const PRODUCTION_PROJECT_ID = "ctmass-8f048";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const row = (label, value) =>
  value
    ? `<p style="font-size:15px;margin:0 0 6px;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`
    : "";

const itemsLine = (items) =>
  Array.isArray(items) && items.length > 0
    ? items
        .map((item) => `${item?.size || "—"} × ${item?.quantity || 1}`)
        .join(", ")
    : "";

const priceLine = (price) =>
  price > 0 ? `${Number(price).toLocaleString("en-US")} coins` : "Free";

const orderSummary = (order) => `
  ${row("Ticket", `#${order.ticketNumber}`)}
  ${row("Item", order.name)}
  ${row("Package", order.packageName)}
  ${row("Sizes", itemsLine(order.items))}
  ${row("Quantity", String(order.quantity))}
  ${row("Total", priceLine(order.price))}
`;

const buildUserHtml = (order) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0C1420;">
    <h2 style="margin:0 0 8px;">Your order ${escapeHtml(order.name)} placed</h2>
    <p style="font-size:15px;line-height:1.6;color:#3b4757;margin:0 0 16px;">
      Thank you for your order! We've received your request and our team is already on it.
      You'll hear back from us soon — usually within 24 hours.
    </p>
    <div style="border-left:3px solid #16B364;padding:8px 12px;background:#f6f9f7;">
      ${orderSummary(order)}
    </div>
    <p style="font-size:12px;color:#9aa7b8;margin-top:24px;">Sent via CTMASS app · ${SUPPORT_EMAIL}</p>
  </div>
`;

const buildAdminHtml = (order) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0C1420;">
    <h2 style="margin:0 0 8px;">New shop order</h2>
    <p style="font-size:14px;color:#3b4757;margin:0 0 16px;">Placed in the CTMASS mobile app.</p>
    ${orderSummary(order)}
    ${row("Customer", order.customerName)}
    ${row("Email", order.email)}
    ${row("Phone", order.phone)}
    ${row("Address", order.address)}
    <p style="font-size:15px;margin:12px 0 6px;"><strong>Message:</strong></p>
    <div style="font-size:15px;line-height:1.6;white-space:pre-wrap;border-left:3px solid #16B364;padding:4px 12px;background:#f6f9f7;">${
      order.message ? escapeHtml(order.message) : "—"
    }</div>
    <p style="font-size:12px;color:#9aa7b8;margin-top:24px;">User: ${escapeHtml(order.userId)}</p>
  </div>
`;

const currentProjectId = () =>
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  getApp().options.projectId ||
  "";

const sendEmail = (privateKey, params) =>
  axios.post(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: privateKey,
      template_params: { from: SUPPORT_EMAIL, ...params },
    },
    { headers: { "content-type": "application/json" } },
  );

export const onShopOrderCreated = onDocumentCreated(
  {
    document: "user_paid_features/{purchaseId}",
    secrets: [secrets.emailjsPrivateKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    const purchase = event.data?.data() || {};
    if (purchase.source !== "mobile") return;

    const details = purchase.purchaseDetails || {};
    const formData = details.formData || {};
    const userId = String(purchase.userId || "");
    const featureKey = String(purchase.featureKey || "");
    const ticketNumber = String(details.ticketNumber || event.params.purchaseId);
    if (!userId || !featureKey) return;

    const db = getFirestore();
    const [featureSnap, profileSnap] = await Promise.all([
      db.collection("paid_features_config").doc(featureKey).get(),
      db.collection("profiles").doc(userId).get(),
    ]);
    const feature = featureSnap.exists ? featureSnap.data() || {} : {};
    const profile = profileSnap.exists ? profileSnap.data() || {} : {};
    const packages = Array.isArray(feature.pricing?.packages)
      ? feature.pricing.packages
      : [];
    const selectedPackage = packages.find((item) => item?.id === details.packageId);

    const order = {
      ticketNumber,
      userId,
      name: String(details.featureName || feature.displayName || featureKey),
      packageName: String(
        details.packageName || selectedPackage?.displayName || "",
      ),
      items: formData.items,
      quantity: Number(details.totalQuantity || 1),
      price: Number(details.price || 0),
      customerName: String(profile.businessName || profile.name || ""),
      email: String(formData.email || "").trim(),
      phone: String(formData.phone || "").trim(),
      address: String(formData.address || "").trim(),
      message: String(formData.message || "").trim(),
    };

    await appendAppNotification(userId, {
      type: "shop_order",
      title: `Your order ${order.name} placed`,
      text: `We've received your order (ticket #${ticketNumber}). Our team is already on it and will follow up shortly.`,
      ticketNumber,
      featureKey,
      appLink: "/shop-orders",
    });

    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    if (!privateKey || currentProjectId() !== PRODUCTION_PROJECT_ID) {
      logger.info("onShopOrderCreated: email skipped", { ticketNumber });
      return;
    }

    const results = await Promise.allSettled([
      sendEmail(privateKey, {
        subject: `Shop order #${ticketNumber} — ${order.name}`,
        html: buildAdminHtml(order),
        mail_to: SUPPORT_EMAIL,
        from_name: order.customerName || "CTMASS App",
      }),
      EMAIL_RE.test(order.email)
        ? sendEmail(privateKey, {
            subject: `Your order ${order.name} placed — #${ticketNumber}`,
            html: buildUserHtml(order),
            mail_to: order.email,
            from_name: "CTMASS Shop",
          })
        : Promise.resolve(null),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.warn("onShopOrderCreated: email failed", {
          ticketNumber,
          target: index === 0 ? "admin" : "customer",
          error: result.reason?.response?.data || result.reason?.message,
        });
      }
    });
    logger.info("onShopOrderCreated: processed", { ticketNumber, featureKey });
  },
);
