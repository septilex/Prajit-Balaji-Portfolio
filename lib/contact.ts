/** Shared delivery path for the contact section and Hire Me dialog. */
export async function sendContactInquiry(fields: { name: string; email: string; message: string }) {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    throw new Error("The contact form is unavailable. Please email prajitk299@gmail.com directly.");
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      name: fields.name.trim(),
      email: fields.email.trim(),
      message: fields.message.trim(),
    }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error("Your message could not be sent. Please try again or email prajitk299@gmail.com.");
  }
}
