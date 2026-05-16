const SESSION_KEY = 'secret_unlocked';
const EMAIL_KEY = 'subscriber_email';
const TOKEN_KEY = 'subscriber_token';

function generateToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isSecretUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function getSubscriberEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

export function unlockSecret(email: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(EMAIL_KEY, email);
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, generateToken());
    }
  } catch {
    // Storage unavailable — allow access anyway.
  }
}

export function getSubscriberToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
