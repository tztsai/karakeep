import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { create } from "zustand";

const SETTING_NAME = "settings";

const zSettingsSchema = z.object({
  apiKey: z.string().optional(),
  apiKeyId: z.string().optional(),
  address: z.string(),
  imageQuality: z.number().optional().default(0.2),
  theme: z.enum(["light", "dark", "system"]).optional().default("system"),
  autoImport: z
    .object({
      enabled: z.boolean().default(false),
      folders: z
        .array(
          z.object({
            uri: z.string(),
            name: z.string(),
            bookmarkStatus: z.enum(["success", "error"]).optional(),
          }),
        )
        .optional()
        .default([]),
      scanIntervalMinutes: z.number().default(30),
      lastScanTimestamp: z.number().optional(),
    })
    .optional()
    .default({
      enabled: false,
      folders: [],
      scanIntervalMinutes: 30,
    }),
});

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export type Settings = z.infer<typeof zSettingsSchema>;

interface AppSettingsState {
  settings: { isLoading: boolean; settings: Settings };
  setSettings: (settings: Settings) => Promise<void>;
  load: () => Promise<void>;
}

const useSettings = create<AppSettingsState>((set, get) => ({
  settings: {
    isLoading: true,
    settings: {
      address: "",
      imageQuality: 0.2,
      theme: "system",
      autoImport: {
        enabled: false,
        folders: [],
        scanIntervalMinutes: 30,
      },
    },
  },
  setSettings: async (settings) => {
    await SecureStore.setItemAsync(SETTING_NAME, JSON.stringify(settings));
    set((_state) => ({ settings: { isLoading: false, settings } }));
  },
  load: async () => {
    if (!get().settings.isLoading) {
      return;
    }
    const strVal = await SecureStore.getItemAsync(SETTING_NAME);
    if (!strVal) {
      set((state) => ({
        settings: { isLoading: false, settings: state.settings.settings },
      }));
      return;
    }
    const parsed = zSettingsSchema.safeParse(JSON.parse(strVal));
    if (!parsed.success) {
      // Wipe the state if invalid
      set((state) => ({
        settings: { isLoading: false, settings: state.settings.settings },
      }));
      return;
    }

    set((_state) => ({
      settings: { isLoading: false, settings: parsed.data },
    }));
  },
}));

export default function useAppSettings() {
  const { settings, setSettings, load } = useSettings();

  return { ...settings, setSettings, load };
}
