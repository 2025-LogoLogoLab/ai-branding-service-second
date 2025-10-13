import { useSyncExternalStore } from 'react';

import type { colorGuideGenResponse } from '../custom_api/colorguide';

type SelectionState = {
  logoBase64?: string;
  brandingMarkdown?: string;
  colorGuide?: colorGuideGenResponse;
};

type Listener = () => void;

const KEY = 'ai:selected:v1';

function load(): SelectionState {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as SelectionState : {};
  } catch {
    return {};
  }
}

function save(s: SelectionState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

// Simple external store
class Store {
  private state: SelectionState = load();
  private listeners = new Set<Listener>();

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = () => this.state;
  private emit() { this.listeners.forEach((l) => l()); save(this.state); }

  setLogo(base64?: string) {
    this.state = { ...this.state, logoBase64: base64 };
    this.emit();
  }
  clearLogo() { this.setLogo(undefined); }

  setBranding(markdown?: string) {
    this.state = { ...this.state, brandingMarkdown: markdown };
    this.emit();
  }
  clearBranding() { this.setBranding(undefined); }

  setColorGuide(guide?: colorGuideGenResponse) {
    this.state = { ...this.state, colorGuide: guide };
    this.emit();
  }
  clearColorGuide() { this.setColorGuide(undefined); }

  clearAll() {
    this.state = {};
    this.emit();
  }
}

const store = new Store();

export function useSelectionStore() {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return {
    state: snapshot,
    setLogo: (b64?: string) => store.setLogo(b64),
    clearLogo: () => store.clearLogo(),
    setBranding: (md?: string) => store.setBranding(md),
    clearBranding: () => store.clearBranding(),
    setColorGuide: (g?: colorGuideGenResponse) => store.setColorGuide(g),
    clearColorGuide: () => store.clearColorGuide(),
    clearAll: () => store.clearAll(),
  };
}
