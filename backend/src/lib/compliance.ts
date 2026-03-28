export class ComplianceEngine {
  /**
   * Sanitizes text to remove potential PII (emails, phone numbers, pattern-matching)
   * Guaranteed to execute before LLM transmission or persistent Audit logging.
   */
  static sanitizePII(text: string): string {
    if (!text) return text;
    let sanitized = text;
    // Mask core email patterns
    sanitized = sanitized.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[REDACTED_EMAIL]');
    // Mask standard international/domestic phone blocks
    sanitized = sanitized.replace(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');
    return sanitized;
  }

  /**
   * Safe logger strips PII recursively before outputting to stdout or external APM clusters
   */
  static safeLog(module: string, message: string, payload?: any) {
    const cleanMessage = this.sanitizePII(message);
    let cleanPayload = payload;
    
    if (payload && typeof payload === 'object') {
       try {
         cleanPayload = JSON.parse(this.sanitizePII(JSON.stringify(payload)));
       } catch (e) {
         cleanPayload = "[UNPARSABLE_RESTRICTED_PAYLOAD]";
       }
    }
    
    console.log(`[${module}] ${cleanMessage}`, cleanPayload ? cleanPayload : '');
  }
}
