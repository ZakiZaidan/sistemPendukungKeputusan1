/**
 * store.js — Zustand state management (replaces Streamlit session_state)
 */

import { create } from 'zustand';
import { DEFAULT_ALTERNATIF, DEFAULT_KRITERIA, DEFAULT_MATRIKS } from './constants';

const useStore = create((set, get) => ({
  // Data state
  alternatif: { ...DEFAULT_ALTERNATIF },
  kriteria: JSON.parse(JSON.stringify(DEFAULT_KRITERIA)),
  matriks: JSON.parse(JSON.stringify(DEFAULT_MATRIKS)),
  v: 0.5,

  // Calculation state
  calculated: false,
  vikorResult: null,
  isLoading: false,
  error: null,

  // Supabase state
  supabaseConnected: false,

  // Toast
  toast: null,

  // Setters
  setAlternatif: (alt) => set({ alternatif: alt, calculated: false, vikorResult: null }),
  setKriteria: (krit) => set({ kriteria: krit, calculated: false, vikorResult: null }),
  setMatriks: (mat) => set({ matriks: mat, calculated: false, vikorResult: null }),
  setV: (v) => set({ v, calculated: false, vikorResult: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSupabaseConnected: (connected) => set({ supabaseConnected: connected }),

  setToast: (toast) => {
    set({ toast });
    if (toast) {
      setTimeout(() => set({ toast: null }), 3000);
    }
  },

  // Set calculation result
  setVikorResult: (result) => set({
    vikorResult: result,
    calculated: true,
    isLoading: false,
  }),

  // Reset to defaults
  resetToDefault: () => set({
    alternatif: { ...DEFAULT_ALTERNATIF },
    kriteria: JSON.parse(JSON.stringify(DEFAULT_KRITERIA)),
    matriks: JSON.parse(JSON.stringify(DEFAULT_MATRIKS)),
    v: 0.5,
    calculated: false,
    vikorResult: null,
  }),

  // Load session data
  loadSession: (data) => set({
    alternatif: data.alternatif,
    kriteria: data.kriteria,
    matriks: data.matriks,
    v: data.v,
    calculated: false,
    vikorResult: null,
  }),

  // Get current input data (for API calls)
  getInputData: () => {
    const { alternatif, kriteria, matriks, v } = get();
    return { alternatif, kriteria, matriks, v };
  },
}));

export default useStore;
