const STORAGE_KEY = 'ptp_ticket_access';

interface AccessRecord {
  email: string;
  expiresAt: string;
  muxToken?: string;
}

type AccessStore = Record<string, AccessRecord>;

function load(): AccessStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(store: AccessStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function hasValidAccess(slug: string): boolean {
  const record = load()[slug];
  if (!record) return false;
  return new Date(record.expiresAt) > new Date();
}

export function storeAccess(slug: string, email: string, expiresAt: string, muxToken?: string) {
  const store = load();
  store[slug] = { email, expiresAt, muxToken };
  save(store);
}

export function getMuxToken(slug: string): string | null {
  const record = load()[slug];
  return record?.muxToken ?? null;
}

export function clearAccess(slug: string) {
  const store = load();
  delete store[slug];
  save(store);
}
