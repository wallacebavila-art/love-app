import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup();
});

// Mock do localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock do window.matchMedia
global.matchMedia = vi.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
