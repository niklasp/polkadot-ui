"use client";

import { ExtensionProvider } from "./polkadot-extension-provider";
import { LightClientApiProvider } from "./polkadot-lightclient-api-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LightClientApiProvider>
      <ExtensionProvider>{children}</ExtensionProvider>
    </LightClientApiProvider>
  );
}
