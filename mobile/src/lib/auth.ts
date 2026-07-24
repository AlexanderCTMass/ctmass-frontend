export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Sign-in is not connected yet. Firebase setup is pending.");
    this.name = "AuthNotConfiguredError";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// Sends a passwordless sign-in link, mirroring the web app's email-link flow.
// TODO(firebase): wire to sendSignInLinkToEmail(auth, email, actionCodeSettings)
// using the shared Firebase project so accounts stay in sync with the web app.
export async function sendLoginLink(_email: string): Promise<void> {
  await Promise.resolve();
  throw new AuthNotConfiguredError();
}

// Native Google sign-in -> Firebase credential.
// TODO(firebase): GoogleSignin.signIn() -> signInWithCredential(
//   auth, GoogleAuthProvider.credential(idToken))
export async function signInWithGoogle(): Promise<void> {
  await Promise.resolve();
  throw new AuthNotConfiguredError();
}
