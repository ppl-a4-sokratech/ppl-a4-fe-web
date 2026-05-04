"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SokratechProvider } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";
import type {
  BehavioralAnalysisResult,
  BehavioralPayload,
  CollectedFingerprint,
  DetectionResult,
  RecipeOptions,
} from "@ppl-sokratech-sdk/ppl-a4-sdk-web";

export const sdkConfig = {
  apiDomain: "http://ec2-52-45-170-166.compute-1.amazonaws.com:3000",
  workflowId: "demo-workflow-id",
  profileId: "demo-profile-id",
};

type BackendRecipeGroup = {
  enabled: boolean;
  [key: string]: boolean;
};

type BackendRecipes = {
  behavioral: BackendRecipeGroup;
  fingerprint: BackendRecipeGroup;
  detection: BackendRecipeGroup;
};

type RuntimeState = {
  status: "loading" | "ready" | "fallback" | "error";
  source: "backend" | "mock";
  errorMessage: string | null;
  backendRecipes: BackendRecipes;
  sdkRecipes: RecipeOptions;
  workflowId: string;
  profileId: string;
  setIdentifiers: (next: { workflowId: string; profileId: string }) => void;
};

const mockBackendRecipes: BackendRecipes = {
  behavioral: {
    enabled: true,
    touch: true,
    drag: true,
    scroll: true,
    lifecycle: true,
    input: true,
    sensor: true,
  },
  fingerprint: {
    enabled: true,
    audio: true,
    canvas: true,
    graphics: true,
    fonts: true,
    device: true,
    screen: true,
  },
  detection: {
    enabled: true,
    emulator: true,
    webDriver: true,
  },
};

function mapBackendToSdkRecipes(recipes: BackendRecipes): RecipeOptions {
  return {
    behavioral: {
      enabled: recipes.behavioral.enabled,
      cursor: recipes.behavioral.touch,
      keyboard: recipes.behavioral.input,
      click: recipes.behavioral.drag,
      mouseScroll: recipes.behavioral.scroll,
      ruleBased: recipes.behavioral.lifecycle,
    },
    fingerprint: {
      enabled: recipes.fingerprint.enabled,
      audio: recipes.fingerprint.audio,
      canvas: recipes.fingerprint.canvas,
      webgl: recipes.fingerprint.graphics,
      fonts: recipes.fingerprint.fonts,
      device: recipes.fingerprint.device,
      browser: false,
      screen: recipes.fingerprint.screen,
    },
    detection: {
      enabled: recipes.detection.enabled,
      headless: recipes.detection.emulator,
      webdriver: recipes.detection.webDriver,
    },
  };
}

const defaultRuntimeState: RuntimeState = {
  status: "loading",
  source: "mock",
  errorMessage: null,
  backendRecipes: mockBackendRecipes,
  sdkRecipes: mapBackendToSdkRecipes(mockBackendRecipes),
  workflowId: sdkConfig.workflowId,
  profileId: sdkConfig.profileId,
  setIdentifiers: () => undefined,
};

const ConfigCheckContext = createContext<RuntimeState>(defaultRuntimeState);

export function useConfigCheck() {
  return useContext(ConfigCheckContext);
}

export function sanitizeBehavioralPayload(payload: BehavioralPayload | null, recipes: RecipeOptions): BehavioralPayload {
  const emptyPayload: BehavioralPayload = {
    cursorEvents: [],
    keyEvents: [],
    pasteEvents: [],
    clickEvents: [],
    mouseScrollEvents: [],
    capturedAt: Date.now(),
  };

  if (!recipes.behavioral?.enabled || !payload) {
    return emptyPayload;
  }

  return {
    ...emptyPayload,
    capturedAt: payload.capturedAt ?? Date.now(),
    cursorEvents: recipes.behavioral.cursor ? (payload.cursorEvents ?? []) : [],
    keyEvents: recipes.behavioral.keyboard ? (payload.keyEvents ?? []) : [],
    pasteEvents: recipes.behavioral.keyboard ? (payload.pasteEvents ?? []) : [],
    clickEvents: recipes.behavioral.click ? (payload.clickEvents ?? []) : [],
    mouseScrollEvents: recipes.behavioral.mouseScroll ? (payload.mouseScrollEvents ?? []) : [],
  };
}

export function sanitizeAnalysisResult(result: BehavioralAnalysisResult | null, recipes: RecipeOptions): BehavioralAnalysisResult {
  return {
    payload: sanitizeBehavioralPayload(result?.payload ?? null, recipes),
    flags: recipes.behavioral?.ruleBased ? result?.flags : undefined,
    analyzedAt: result?.analyzedAt ?? Date.now(),
  };
}

export function sanitizeFingerprintData(data: CollectedFingerprint | null, recipes: RecipeOptions): CollectedFingerprint {
  const fallbackTimestamp = data?.timestamp ?? Date.now();
  const fingerprintEnabled = recipes.fingerprint?.enabled;
  if (!fingerprintEnabled) {
    return {
      timestamp: fallbackTimestamp,
      audio: null,
      canvas: null,
      webgl: null,
      fonts: [],
      device: null as never,
      browser: null as never,
      screen: null as never,
    };
  }

  return {
    timestamp: fallbackTimestamp,
    audio: recipes.fingerprint?.audio ? (data?.audio ?? null) : null,
    canvas: recipes.fingerprint?.canvas ? (data?.canvas ?? null) : null,
    webgl: recipes.fingerprint?.webgl ? (data?.webgl ?? null) : null,
    fonts: recipes.fingerprint?.fonts ? (data?.fonts ?? []) : [],
    device: recipes.fingerprint?.device ? (data?.device ?? null as never) : null as never,
    browser: recipes.fingerprint?.browser ? (data?.browser ?? null as never) : null as never,
    screen: recipes.fingerprint?.screen ? (data?.screen ?? null as never) : null as never,
  };
}

export function sanitizeDetectionData(data: DetectionResult | null, recipes: RecipeOptions): DetectionResult {
  if (!recipes.detection?.enabled) {
    return { timestamp: data?.timestamp ?? Date.now() };
  }

  return {
    timestamp: data?.timestamp ?? Date.now(),
    headless: recipes.detection.headless ? data?.headless : undefined,
    webdriver: recipes.detection.webdriver ? data?.webdriver : undefined,
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [runtimeState, setRuntimeState] = useState<RuntimeState>(defaultRuntimeState);
  const [identifiers, setIdentifiersState] = useState({
    workflowId: sdkConfig.workflowId,
    profileId: sdkConfig.profileId,
  });

  const setIdentifiers = useCallback(({ workflowId, profileId }: { workflowId: string; profileId: string }) => {
    setIdentifiersState({
      workflowId: workflowId.trim(),
      profileId: profileId.trim(),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setRuntimeState((prev) => ({
      ...prev,
      status: "loading",
      errorMessage: null,
      workflowId: identifiers.workflowId,
      profileId: identifiers.profileId,
      setIdentifiers,
    }));

    async function loadConfig() {
      const endpoint = `${sdkConfig.apiDomain}/sdk/v1/config/${identifiers.workflowId}/${identifiers.profileId}`;

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Config request failed with status ${response.status}`);
        }
        const json = await response.json() as { recipes?: BackendRecipes };
        if (!json.recipes) {
          throw new Error("Config response missing recipes");
        }

        setRuntimeState({
          status: "ready",
          source: "backend",
          errorMessage: null,
          backendRecipes: json.recipes,
          sdkRecipes: mapBackendToSdkRecipes(json.recipes),
          workflowId: identifiers.workflowId,
          profileId: identifiers.profileId,
          setIdentifiers,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        setRuntimeState({
          status: "fallback",
          source: "mock",
          errorMessage: message,
          backendRecipes: mockBackendRecipes,
          sdkRecipes: mapBackendToSdkRecipes(mockBackendRecipes),
          workflowId: identifiers.workflowId,
          profileId: identifiers.profileId,
          setIdentifiers,
        });
      }
    }

    loadConfig();
    return () => controller.abort();
  }, [identifiers.profileId, identifiers.workflowId, setIdentifiers]);

  const providerConfig = useMemo(
    () => ({
      apiKey: "mock-dynamic-config",
      apiDomain: sdkConfig.apiDomain,
      recipes: runtimeState.sdkRecipes,
      profiling: {
        enabled: true,
      },
    }),
    [runtimeState.sdkRecipes]
  );

  const providerKey = `${runtimeState.workflowId}:${runtimeState.profileId}:${runtimeState.status}:${runtimeState.source}`;

  return (
    <ConfigCheckContext.Provider value={runtimeState}>
      <SokratechProvider key={providerKey} config={providerConfig}>{children}</SokratechProvider>
    </ConfigCheckContext.Provider>
  );
}
