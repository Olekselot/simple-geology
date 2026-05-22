const BASE = "http://localhost:5033/api/admin";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function req<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(token),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function adminLogin(login: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) throw new Error("Невірний логін або пароль");
  const data = await res.json();
  return data.token as string;
}

// Hierarchy
export const getTopLevelCategories = (t: string) => req<any[]>("GET", "/hierarchy/top-level", t);
export const addTopLevelCategory = (t: string, b: any) => req<any>("POST", "/hierarchy/top-level", t, b);
export const updateTopLevelCategory = (t: string, id: number, b: any) => req<void>("PUT", `/hierarchy/top-level/${id}`, t, b);
export const deleteTopLevelCategory = (t: string, id: number) => req<void>("DELETE", `/hierarchy/top-level/${id}`, t);

export const getRockTypes = (t: string) => req<any[]>("GET", "/hierarchy/rock-types", t);
export const addRockType = (t: string, b: any) => req<any>("POST", "/hierarchy/rock-types", t, b);
export const updateRockType = (t: string, id: number, b: any) => req<void>("PUT", `/hierarchy/rock-types/${id}`, t, b);
export const deleteRockType = (t: string, id: number) => req<void>("DELETE", `/hierarchy/rock-types/${id}`, t);

export const getRockSubtypes = (t: string, rockTypeId?: number) =>
  req<any[]>("GET", `/hierarchy/rock-subtypes${rockTypeId ? `?rockTypeId=${rockTypeId}` : ""}`, t);
export const addRockSubtype = (t: string, b: any) => req<any>("POST", "/hierarchy/rock-subtypes", t, b);
export const updateRockSubtype = (t: string, id: number, b: any) => req<void>("PUT", `/hierarchy/rock-subtypes/${id}`, t, b);
export const deleteRockSubtype = (t: string, id: number) => req<void>("DELETE", `/hierarchy/rock-subtypes/${id}`, t);

export const getMineralClasses = (t: string) => req<any[]>("GET", "/hierarchy/mineral-classes", t);
export const addMineralClass = (t: string, b: any) => req<any>("POST", "/hierarchy/mineral-classes", t, b);
export const updateMineralClass = (t: string, id: number, b: any) => req<void>("PUT", `/hierarchy/mineral-classes/${id}`, t, b);
export const deleteMineralClass = (t: string, id: number) => req<void>("DELETE", `/hierarchy/mineral-classes/${id}`, t);

export const getSilicateStructures = (t: string) => req<any[]>("GET", "/hierarchy/silicate-structures", t);
export const addSilicateStructure = (t: string, b: any) => req<any>("POST", "/hierarchy/silicate-structures", t, b);
export const updateSilicateStructure = (t: string, id: number, b: any) => req<void>("PUT", `/hierarchy/silicate-structures/${id}`, t, b);
export const deleteSilicateStructure = (t: string, id: number) => req<void>("DELETE", `/hierarchy/silicate-structures/${id}`, t);

// Leaves
export const getMinerals = (t: string) => req<any[]>("GET", "/minerals", t);
export const addMineral = (t: string, b: any) => req<any>("POST", "/minerals", t, b);
export const updateMineral = (t: string, id: number, b: any) => req<void>("PUT", `/minerals/${id}`, t, b);
export const deleteMineral = (t: string, id: number) => req<void>("DELETE", `/minerals/${id}`, t);

export const getRocks = (t: string) => req<any[]>("GET", "/rocks", t);
export const addRock = (t: string, b: any) => req<any>("POST", "/rocks", t, b);
export const updateRock = (t: string, id: number, b: any) => req<void>("PUT", `/rocks/${id}`, t, b);
export const deleteRock = (t: string, id: number) => req<void>("DELETE", `/rocks/${id}`, t);

// Characteristics
export const getMineralCharacteristics = (t: string) => req<any[]>("GET", "/characteristics", t);
export const addMineralCharacteristic = (t: string, b: any) => req<any>("POST", "/characteristics", t, b);
export const updateMineralCharacteristic = (t: string, id: number, b: any) => req<void>("PUT", `/characteristics/${id}`, t, b);
export const deleteMineralCharacteristic = (t: string, id: number) => req<void>("DELETE", `/characteristics/${id}`, t);

export const getRockCompositions = (t: string) => req<any[]>("GET", "/rock-compositions", t);
export const addRockComposition = (t: string, b: any) => req<any>("POST", "/rock-compositions", t, b);
export const updateRockComposition = (t: string, id: number, b: any) => req<void>("PUT", `/rock-compositions/${id}`, t, b);
export const deleteRockComposition = (t: string, id: number) => req<void>("DELETE", `/rock-compositions/${id}`, t);

// Site texts
export const getSiteTexts = (t: string) => req<any[]>("GET", "/site-texts", t);
export const updateSiteText = (t: string, key: string, value: string) =>
  req<void>("PUT", `/site-texts/${encodeURIComponent(key)}`, t, { value });

// History
export const getAuditLog = (t: string, limit = 200) => req<any[]>("GET", `/audit-log?limit=${limit}`, t);
