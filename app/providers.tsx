"use client";

import { SokratechProvider } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";

const sdkConfig = {
  apiKey: 'demo-api-key-12345',
  apiDomain: 'https://api.sokratech.example',
  recipes: {
    behavioral: {
      enabled: true,
      mouse: true,
      keyboard: true,
    },
    fingerprint: {
      enabled: true,
      audio: true,
      canvas: true,
      webgl: true,
      fonts: true,
      device: true,
      browser: true,
      screen: true,
    },
    detection: {
      enabled: true,
      headless: true,
      webdriver: true,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SokratechProvider config={sdkConfig}>
      {children}
    </SokratechProvider>
  );
}
