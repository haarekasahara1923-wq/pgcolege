// WhatsApp helper functions & Cloud API notification

interface EnquiryNotificationData {
  name: string;
  phone: string;
  email?: string | null;
  collegeName?: string | null;
  courseName?: string | null;
  message: string;
  source: string;
}

export async function sendWhatsAppNotification(data: EnquiryNotificationData): Promise<void> {
  if (process.env.WHATSAPP_CLOUD_API_ENABLED !== "true") return;

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminNumber = process.env.ADMIN_NOTIFY_NUMBER;

  if (!token || !phoneNumberId || !adminNumber) {
    console.warn("WhatsApp Cloud API credentials not configured");
    return;
  }

  const messageBody =
    `*New Enquiry Received*\n\n` +
    `*Name:* ${data.name}\n` +
    `*Phone:* ${data.phone}\n` +
    (data.email ? `*Email:* ${data.email}\n` : "") +
    (data.collegeName ? `*College:* ${data.collegeName}\n` : "") +
    (data.courseName ? `*Course:* ${data.courseName}\n` : "") +
    `*Source:* ${data.source}\n` +
    `*Message:* ${data.message}`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminNumber,
          type: "text",
          text: { body: messageBody },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp API error:", error);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
    // Non-fatal: application functions normally without it
  }
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  // Strip any leading +, spaces, or dashes
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryMessage({
  name,
  mobile,
  college,
  course,
  message,
}: {
  name: string;
  mobile: string;
  college?: string | null;
  course?: string | null;
  message?: string | null;
}): string {
  let msg = `Hello Prathvi Group of College, I am ${name}. Mobile: ${mobile}.`;
  if (college && course) {
    msg += ` I am interested in ${college} - ${course}.`;
  } else if (college) {
    msg += ` I am interested in ${college}.`;
  }
  if (message && message.trim().length > 0) {
    msg += ` Message: ${message.trim()}`;
  }
  return msg;
}
