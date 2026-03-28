export function redactPII(text: string): string {
  if (!text) return text;
  
  let redactedText = text;

  // Redact Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  redactedText = redactedText.replace(emailRegex, '[REDACTED_EMAIL]');

  // Redact Phone Numbers (Simple format)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  redactedText = redactedText.replace(phoneRegex, '[REDACTED_PHONE]');

  // Redact SSN-like patterns
  const ssnRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;
  redactedText = redactedText.replace(ssnRegex, '[REDACTED_SSN]');

  // Redact Credit Cards
  const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  redactedText = redactedText.replace(ccRegex, '[REDACTED_CC]');

  return redactedText;
}
