import { expect, vi } from "vitest";

// Mock React Native modules
vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  Alert: {
    alert: vi.fn(),
  },
  AppState: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
}));

// Mock Expo modules
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock("expo-file-system", () => ({
  getInfoAsync: vi.fn(),
  StorageAccessFramework: {
    readDirectoryAsync: vi.fn(),
  },
}));

vi.mock("expo-background-task", () => ({
  registerTaskAsync: vi.fn(),
  unregisterTaskAsync: vi.fn(),
  BackgroundTaskResult: {
    Success: "success",
    Failed: "failed",
  },
}));

vi.mock("expo-task-manager", () => ({
  defineTask: vi.fn(),
}));

// Mock react-native-blob-util
vi.mock("react-native-blob-util", () => ({
  fetch: vi.fn(),
  wrap: vi.fn((path) => `wrapped:${path}`),
}));

// Mock WatermelonDB
vi.mock("@nozbe/watermelondb", () => ({
  Database: vi.fn(),
  Q: {
    where: vi.fn((field, value) => ({ field, value, type: "where" })),
    and: vi.fn((...conditions) => ({ conditions, type: "and" })),
    or: vi.fn((...conditions) => ({ conditions, type: "or" })),
  },
}));

vi.mock("@nozbe/watermelondb/adapters/sqlite", () => ({
  default: vi.fn(),
}));

vi.mock("@nozbe/watermelondb/decorators", () => ({
  field: vi.fn(() => (target: any, propertyKey: string) => {}),
  text: vi.fn(() => (target: any, propertyKey: string) => {}),
  date: vi.fn(() => (target: any, propertyKey: string) => {}),
  readonly: vi.fn(() => (target: any, propertyKey: string) => {}),
}));

// Mock tRPC
vi.mock("../lib/trpc", () => ({
  api: {
    bookmarks: {
      createBookmark: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    },
    useUtils: vi.fn(),
  },
}));

// Mock app settings
vi.mock("../lib/settings", () => ({
  default: vi.fn(() => ({
    settings: {
      address: "http://localhost:3000",
      apiKey: "test-api-key",
      autoImport: {
        enabled: true,
        folderUri: "file://test-folder",
        scanIntervalMinutes: 60,
      },
    },
  })),
}));

// Global test utilities
global.setImmediate =
  global.setImmediate ||
  ((fn: (...args: any[]) => void, ...args: any[]) =>
    global.setTimeout(fn, 0, ...args));
