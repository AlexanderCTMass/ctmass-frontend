const ANDROID_CHANNEL_ID = "default";
const MAX_BODY_LENGTH = 240;

const clip = (value, max) => {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const collapseKey = (value) => {
  const key = String(value || "").replace(/[^A-Za-z0-9:_.-]/g, "_").slice(0, 60);
  return key || null;
};

export const buildPushMessage = ({ tokens, title, body, data, collapseId }) => {
  const tag = collapseKey(collapseId);
  const safeTitle = clip(title || "CTMASS", 80);
  const safeBody = clip(body, MAX_BODY_LENGTH);

  return {
    tokens,
    data: { ...data, title: safeTitle, body: safeBody, ...(tag ? { tag } : {}) },
    android: {
      priority: "high",
      notification: {
        title: safeTitle,
        body: safeBody,
        channelId: ANDROID_CHANNEL_ID,
        sound: "default",
        ...(tag ? { tag } : {}),
      },
    },
    apns: {
      headers: {
        "apns-priority": "10",
        "apns-push-type": "alert",
        ...(tag ? { "apns-collapse-id": tag } : {}),
      },
      payload: {
        aps: {
          alert: { title: safeTitle, body: safeBody },
          sound: "default",
        },
      },
    },
    webpush: { headers: { Urgency: "high" } },
  };
};

export const isInvalidToken = (error) => {
  const code = error?.code || "";
  if (
    code.includes("registration-token-not-registered") ||
    code.includes("invalid-registration-token")
  ) {
    return true;
  }
  return (
    code.includes("invalid-argument") &&
    /registration token/i.test(error?.message || "")
  );
};

export const summarizeResponses = (res) => {
  const errors = {};
  res.responses.forEach((r) => {
    if (r.success) return;
    const code = r.error?.code || "unknown";
    errors[code] = (errors[code] || 0) + 1;
  });
  return {
    success: res.successCount,
    failure: res.failureCount,
    ...(res.failureCount > 0 ? { errors } : {}),
  };
};
