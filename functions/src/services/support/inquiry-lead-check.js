import { promises as dns } from "node:dns";
import { getAuth } from "firebase-admin/auth";

const BOT_EMAIL_RE =
  /(crawler|testlab|cloudtestlabaccounts|pre-?launch|^robo[^@]*@|^test@|@example\.(com|org|net)$)/i;
const GOOGLE_HOST_RE =
  /(\.1e100\.net|\.googleusercontent\.com|\.google\.com|\.googlebot\.com)\.?$/i;
const FAST_FORM_MS = 8000;
const DNS_TIMEOUT_MS = 1500;

const clientIp = (rawRequest) =>
  String(rawRequest?.headers?.["x-forwarded-for"] || rawRequest?.ip || "")
    .split(",")[0]
    .trim();

const reverseHost = async (ip) => {
  if (!ip) return "";
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), DNS_TIMEOUT_MS),
      ),
    ]);
    return names[0] || "";
  } catch {
    return "";
  }
};

const readAccountCreatedAt = async (uid) => {
  if (!uid) return null;
  try {
    const user = await getAuth().getUser(uid);
    const created = Date.parse(user.metadata.creationTime);
    return Number.isFinite(created) ? created : null;
  } catch {
    return null;
  }
};

const readMeta = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const text = (value) => String(value ?? "").slice(0, 120);
  const formMs = Number(raw.formMs);
  return {
    formMs: Number.isFinite(formMs) && formMs >= 0 ? formMs : null,
    signedIn: raw.signedIn === true,
    appVersion: text(raw.appVersion),
    platform: text(raw.platform),
    osVersion: text(raw.osVersion),
    deviceModel: text(raw.deviceModel),
    deviceBrand: text(raw.deviceBrand),
    isDevice: typeof raw.isDevice === "boolean" ? raw.isDevice : null,
    page: text(raw.page),
  };
};

const formatDuration = (ms) => {
  if (ms === null) return "—";
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)} min`;
};

export const assessInquiryLead = async ({ request, replyTo, name, source }) => {
  const meta = readMeta(request.data?.meta);
  const uid = request.auth?.uid || null;
  const signInProvider = request.auth?.token?.firebase?.sign_in_provider || "";
  const anonymous = !uid || signInProvider === "anonymous";
  const isWeb = source.startsWith("web");
  const ip = clientIp(request.rawRequest);
  const userAgent = String(
    request.rawRequest?.headers?.["user-agent"] || "",
  ).slice(0, 300);
  const [host, createdAt] = await Promise.all([
    reverseHost(ip),
    readAccountCreatedAt(uid),
  ]);
  const accountAgeMs = createdAt ? Date.now() - createdAt : null;

  const reasons = [];
  let score = 0;
  const flag = (points, reason) => {
    score += points;
    reasons.push(reason);
  };

  if (BOT_EMAIL_RE.test(replyTo)) {
    flag(3, "Email looks like an automated test account");
  }
  if (GOOGLE_HOST_RE.test(host)) {
    flag(3, `Sent from Google's network (${host}) — typical for Play pre-launch / Firebase Test Lab robots`);
  }
  if (meta?.isDevice === false) {
    flag(3, "Sent from an emulator, not a physical device");
  }
  if (isWeb && !request.app) {
    flag(2, "No App Check token — the request did not come through our website");
  }
  if (
    meta &&
    !meta.signedIn &&
    meta.formMs !== null &&
    meta.formMs < FAST_FORM_MS
  ) {
    flag(2, `Form filled in ${formatDuration(meta.formMs)} without prefilled details`);
  }
  if (!meta) {
    flag(1, "No device info — old app version or a direct API call");
  }
  if (!name || /^guest$/i.test(name)) {
    flag(1, "No real name given");
  }

  const verdict = score >= 4 ? "likely-bot" : score >= 2 ? "possible-bot" : "human";

  const details = [
    ["App version", meta?.appVersion],
    [
      "Platform",
      [meta?.platform, meta?.osVersion].filter(Boolean).join(" "),
    ],
    [
      "Device",
      [meta?.deviceBrand, meta?.deviceModel].filter(Boolean).join(" "),
    ],
    [
      "Physical device",
      meta?.isDevice === null || meta?.isDevice === undefined
        ? ""
        : meta.isDevice
          ? "Yes"
          : "No (emulator)",
    ],
    ["Page", meta?.page],
    ["Time on form", meta ? formatDuration(meta.formMs) : ""],
    ["Signed in", anonymous ? "No (guest)" : `Yes (${signInProvider || "account"})`],
    [
      "Account created",
      createdAt ? `${new Date(createdAt).toISOString()} (${formatDuration(accountAgeMs)} ago)` : "",
    ],
    ["App Check", isWeb ? (request.app ? "Verified" : "Missing") : ""],
    ["IP", ip],
    ["Network host", host],
    ["User agent", userAgent],
  ].filter(([, value]) => Boolean(value));

  return { verdict, score, reasons, details };
};
