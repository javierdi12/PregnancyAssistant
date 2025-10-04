// Function to map Firebase errors to user-friendly messages
export function getFirebaseErrorMessage(error: any): string {
  // Itry to get code directly
  let code = error?.code;

  //obtain code from customData if not present
  if (!code && error?.customData?._tokenResponse?.error?.message) {
    const apiMsg = error.customData._tokenResponse.error.message;
    // mapping 
    if (apiMsg === "EMAIL_EXISTS") code = "auth/email-already-in-use";
    if (apiMsg === "EMAIL_NOT_FOUND") code = "auth/user-not-found";
    if (apiMsg === "INVALID_PASSWORD") code = "auth/wrong-password";
    if (apiMsg === "WEAK_PASSWORD") code = "auth/weak-password";
  }

  // amigable message
  switch (code) {
    case 'auth/email-already-in-use':
      return "El correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
    case 'auth/weak-password':
      return "La contraseña es muy débil. Usa al menos 6 caracteres.";
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Correo o contraseña incorrectos. Intenta de nuevo.";
    case 'auth/invalid-email':
      return "El formato del correo es inválido.";
    default:
      return "Ocurrió un error inesperado: " + (error?.message ?? "Desconocido");
  }
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}