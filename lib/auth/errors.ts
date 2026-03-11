import type { AuthError } from "@supabase/supabase-js";

const CODE_TRANSLATIONS: Record<string, string> = {
  // Login
  invalid_credentials: "El email o la contraseña son incorrectos",
  user_not_found: "No se encontró una cuenta con ese email",
  email_not_confirmed:
    "Necesitás confirmar tu email antes de iniciar sesión. Revisá tu casilla de correo",
  user_banned: "Tu cuenta fue suspendida",

  // Signup
  email_exists: "Ya existe una cuenta con ese email",
  user_already_exists: "Ya existe una cuenta con ese email",
  signup_disabled: "El registro está deshabilitado temporalmente",
  email_address_invalid: "El formato del email no es válido",

  // Password
  weak_password:
    "La contraseña es demasiado débil. Debe tener al menos 6 caracteres",

  // Rate limiting
  over_request_rate_limit:
    "Demasiados intentos. Por favor esperá unos minutos antes de volver a intentar",
  over_email_send_rate_limit:
    "Se superó el límite de envíos de email. Intentá de nuevo más tarde",

  // Session / token
  session_expired: "Tu sesión expiró. Por favor iniciá sesión de nuevo",
  otp_expired: "El enlace expiró o no es válido. Solicitá uno nuevo",

  // Validation
  validation_failed: "Los datos ingresados no son válidos",
};

const MESSAGE_PATTERNS: Array<{ pattern: string; translation: string }> = [
  {
    pattern: "you can only request this after",
    translation:
      "Por seguridad, tenés que esperar antes de volver a intentar",
  },
  {
    pattern: "Password should be at least",
    translation: "La contraseña debe tener al menos 6 caracteres",
  },
  {
    pattern: "Password should contain at least",
    translation: "La contraseña debe incluir minúsculas, mayúsculas y números",
  },
  {
    pattern: "rate limit",
    translation: "Demasiados intentos. Por favor esperá unos minutos",
  },
  {
    pattern: "Email link is invalid or has expired",
    translation: "El enlace expiró o no es válido",
  },
];

const FALLBACK_ERROR = "Ocurrió un error. Por favor intentá de nuevo";

export function translateAuthError(error: AuthError): string {
  if (error.code) {
    const translated = CODE_TRANSLATIONS[error.code];
    if (translated) return translated;
  }

  const message = error.message;
  for (const { pattern, translation } of MESSAGE_PATTERNS) {
    if (message.includes(pattern)) return translation;
  }

  return FALLBACK_ERROR;
}
