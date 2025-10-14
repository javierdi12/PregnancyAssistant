import { Alert } from 'react-native';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../FireBase';
import { getFirebaseErrorMessage, isValidEmail } from '../utils/firebaseError';

type LoadingHandler = (value: boolean) => void;
type MountedChecker = () => boolean;

interface EmailAuthCommonParams {
  email: string;
  setLoading: LoadingHandler;
  isMounted: MountedChecker;
}

interface EmailSignInParams extends EmailAuthCommonParams {
  password: string;
  checkTermsAccepted: () => Promise<boolean>;
  onSuccess: (termsAccepted: boolean) => void | Promise<void>;
}

interface EmailSignUpParams extends EmailAuthCommonParams {
  password: string;
}

const createSafeSetLoading = (setLoading: LoadingHandler, isMounted: MountedChecker) => {
  return (value: boolean) => {
    if (isMounted()) {
      setLoading(value);
    }
  };
};

export const emailSignIn = async ({
  email,
  password,
  setLoading,
  isMounted,
  checkTermsAccepted,
  onSuccess
}: EmailSignInParams): Promise<void> => {
  const safeSetLoading = createSafeSetLoading(setLoading, isMounted);

  safeSetLoading(true);

  if (!email || !password) {
    Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contrasena.');
    safeSetLoading(false);
    return;
  }

  if (!isValidEmail(email)) {
    Alert.alert('Email invalido', 'Por favor, ingresa un correo electronico valido.');
    safeSetLoading(false);
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user);
      Alert.alert(
        'Verificacion requerida',
        'Tu correo aun no esta verificado. Te reenviamos el email de verificacion.'
      );
      await signOut(auth);
      return;
    }

    if (isMounted()) {
      const termsAccepted = await checkTermsAccepted();
      await onSuccess(termsAccepted);
    }
  } catch (error) {
    const errorMsg = getFirebaseErrorMessage(error);
    Alert.alert('Error', errorMsg);
  } finally {
    safeSetLoading(false);
  }
};

export const emailSignUp = async ({
  email,
  password,
  setLoading,
  isMounted
}: EmailSignUpParams): Promise<void> => {
  const safeSetLoading = createSafeSetLoading(setLoading, isMounted);

  safeSetLoading(true);

  if (!email || !password) {
    Alert.alert('Campos requeridos', 'Por favor, ingresa tu correo y contrasena.');
    safeSetLoading(false);
    return;
  }

  if (!isValidEmail(email)) {
    Alert.alert('Email invalido', 'Por favor, ingresa un correo electronico valido.');
    safeSetLoading(false);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    Alert.alert(
      'Verifica tu correo',
      'Te enviamos un email de verificacion. Abrelo y toca el enlace para activar tu cuenta.'
    );
    await signOut(auth);
  } catch (error) {
    const errorMsg = getFirebaseErrorMessage(error);
    Alert.alert('Error', errorMsg);
  } finally {
    safeSetLoading(false);
  }
};

export const emailResetPassword = async ({
  email,
  setLoading,
  isMounted
}: EmailAuthCommonParams): Promise<void> => {
  const safeSetLoading = createSafeSetLoading(setLoading, isMounted);

  if (!email) {
    Alert.alert('Campo requerido', 'Por favor, ingresa tu correo para restablecer la contrasena.');
    return;
  }

  safeSetLoading(true);

  try {
    await sendPasswordResetEmail(auth, email);
    Alert.alert(
      'Correo enviado',
      'Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contrasena.'
    );
  } catch (error) {
    const errorMsg = getFirebaseErrorMessage(error);
    Alert.alert('Error', errorMsg);
  } finally {
    safeSetLoading(false);
  }
};
