/**
 * api.js — Fetch wrapper for FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res;
}

export async function calculateVikor(data) {
  const res = await fetchAPI('/api/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function runSensitivity(data) {
  const res = await fetchAPI('/api/sensitivity', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getDefaults() {
  const res = await fetchAPI('/api/defaults');
  return res.json();
}

export async function getHealth() {
  const res = await fetchAPI('/api/health');
  return res.json();
}

// Sessions
export async function getSessions() {
  const res = await fetchAPI('/api/sessions');
  return res.json();
}

export async function saveSession(data) {
  const res = await fetchAPI('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getSessionDetail(id) {
  const res = await fetchAPI(`/api/sessions/${id}`);
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetchAPI(`/api/sessions/${id}`, { method: 'DELETE' });
  return res.json();
}

// Hasil
export async function saveHasil(sessionId, data) {
  const res = await fetchAPI(`/api/sessions/${sessionId}/hasil`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getRiwayat() {
  const res = await fetchAPI('/api/riwayat');
  return res.json();
}

export async function getRiwayatDetail(id) {
  const res = await fetchAPI(`/api/riwayat/${id}`);
  return res.json();
}

// Export Excel
export async function exportExcel(data) {
  const res = await fetchAPI('/api/export', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.blob();
}
