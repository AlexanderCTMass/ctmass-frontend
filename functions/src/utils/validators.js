export function validatePhoneNumber(phone) {
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(phone)) {
        throw new Error("Invalid phone number format. Use +1XXXXXXXXXX (US numbers only)");
    }
    return phone;
}

export function validateSMSRequest(data) {
    const { to, message, sender } = data;

    if (!to) throw new Error("Phone number (to) is required");
    if (!message) throw new Error("Message is required");

    validatePhoneNumber(to);

    if (sender && sender.length > 11) {
        throw new Error("Sender name must be 11 characters or less");
    }

    return { to, message, sender: sender || "CTMASS" };
}