const EMAIL_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;

const RESERVED_DOMAINS = new Set([
    "example.com",
    "example.org",
    "example.net"
]);

const RESERVED_TLDS = new Set([
    "test",
    "example",
    "invalid",
    "localhost",
    "local"
]);

const UNDELIVERABLE_LOCAL_PARTS = new Set([
    "noreply",
    "no-reply",
    "donotreply",
    "do-not-reply"
]);

export const normalizeEmail = (value) => {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim().toLowerCase();
};

export const isValidEmail = (value) => {
    const email = normalizeEmail(value);

    if (!email || email.length > MAX_EMAIL_LENGTH) {
        return false;
    }

    if (!EMAIL_PATTERN.test(email)) {
        return false;
    }

    const [localPart, domain] = email.split("@");

    if (localPart.length > MAX_LOCAL_PART_LENGTH) {
        return false;
    }

    if (UNDELIVERABLE_LOCAL_PARTS.has(localPart)) {
        return false;
    }

    if (RESERVED_DOMAINS.has(domain)) {
        return false;
    }

    return !RESERVED_TLDS.has(domain.split(".").pop());
};
