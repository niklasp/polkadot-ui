"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLightClientApi } from "@/providers/polkadot-lightclient-api-provider";
import { isSS58Address } from "../util";
import { polkadotPeople } from "@polkadot-api/descriptors";
import { TypedApi } from "polkadot-api";
import { WsEvent } from "polkadot-api/ws-provider/web";
import { useConnectionStatus } from "./use-connection-status";

export function useIdentity(address: string | null | undefined) {
  const { api } = useLightClientApi();
  const connectionStatus = useConnectionStatus();
  const [identity, setIdentity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getIdentity = useCallback(
    async (address: string) => {
      if (!api) {
        return null;
      }
      const identityApi = api as TypedApi<typeof polkadotPeople>;
      const registration = await identityApi.query.Identity.IdentityOf.getValue(
        address
      );

      if (
        registration &&
        registration.info.display.value &&
        typeof registration.info.display.value !== "number"
      ) {
        setIdentity(registration.info.display.value?.asText() || null);
      } else {
        setIdentity(null);
      }
    },
    [api]
  );

  useEffect(() => {
    if (address && isSS58Address(address)) {
      console.log("address", address);
      getIdentity(address);
    } else {
      setIdentity(null);
    }
  }, [address, getIdentity]);

  return { identity, isLoading, error };
}
