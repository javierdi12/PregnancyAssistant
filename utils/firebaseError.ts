// Function to map Firebase errors to user-friendly messages
export function getFirebaseErrorMessage(error: any): string {
  let code = error?.code;

  if (!code && error?.customData?._tokenResponse?.error?.message) {
    const apiMessage = error.customData._tokenResponse.error.message;
    switch (apiMessage) {
      case "EMAIL_EXISTS":
        code = "auth/email-already-in-use";
        break;
      case "EMAIL_NOT_FOUND":
        code = "auth/user-not-found";
        break;
      case "INVALID_PASSWORD":
        code = "auth/wrong-password";
        break;
      case "WEAK_PASSWORD":
        code = "auth/weak-password";
        break;
      default:
        break;
    }
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "El correo ya esta registrado. Intenta iniciar sesion o usa otro correo.";
    case "auth/weak-password":
      return "La contrasena es muy debil. Usa al menos 6 caracteres.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contrasena incorrectos. Intenta de nuevo.";
    case "auth/invalid-email":
      return "El formato del correo es invalido.";
    case "auth/too-many-requests":
      return "Cuenta sin verificar. Verifica tu correo e intenta nuevamente.";
    default:
      return "Ocurrio un error inesperado: " + (error?.message ?? "Desconocido");
  }
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}