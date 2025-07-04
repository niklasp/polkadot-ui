"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLightClientApi } from "@/providers/polkadot-lightclient-api-provider";
import { polkadotPeople } from "@polkadot-api/descriptors";
import { TypedApi } from "polkadot-api";
import { apiHasIdentity } from "../util";
import { StatusChange, WsEvent } from "polkadot-api/ws-provider/web";

export interface FormattedIdentity {
  display?: string;
  email?: string;
  legal?: string;
  matrix?: string;
  twitter?: string;
  web?: string;
}

export function useIdentityByDisplayName(
  displayName: string | null | undefined
) {
  const { api, connectionStatus } = useLightClientApi();
  const [results, setResults] = useState<
    {
      address: string;
      identity: FormattedIdentity;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const entriesCache = useRef<{ api: typeof api; entries: any[] } | null>(null);

  useEffect(() => {
    if (
      connectionStatus?.type === WsEvent.CONNECTED ||
      connectionStatus?.type === WsEvent.CONNECTING
    ) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [connectionStatus]);

  const searchIdentity = useCallback(
    async (displayName: string) => {
      if (!api) {
        setError(new Error("API not available"));
        setResults([]);
        return;
      }

      if (!apiHasIdentity(api)) {
        setError(new Error("Identity pallet not available"));
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let entries;
        if (entriesCache.current && entriesCache.current.api === api) {
          entries = entriesCache.current.entries;
        } else {
          const identityApi = api as TypedApi<typeof polkadotPeople>;
          entries = await identityApi.query.Identity.IdentityOf.getEntries();
          entriesCache.current = { api, entries };
        }
        const matches: { address: string; identity: FormattedIdentity }[] = [];
        for (const { keyArgs, value } of entries) {
          if (
            !value ||
            !value.info.display.value ||
            !value.info.display.value.asText
          )
            continue;
          const display = value.info.display.value.asText();
          if (
            display &&
            display.toLowerCase().includes(displayName.toLowerCase())
          ) {
            matches.push({
              address: keyArgs[0] as string,
              identity: {
                display,
                email: value.info.email.value?.asText(),
                legal: value.info.legal.value?.asText(),
                matrix: value.info.matrix.value?.asText(),
                twitter: value.info.twitter.value?.asText(),
                web: value.info.web.value?.asText(),
              },
            });
          }
        }
        setResults(matches);
        setIsLoading(false);
      } catch (e) {
        console.error("error", e);
        setError(e instanceof Error ? e : new Error("Unknown error"));
        setResults([]);
        setIsLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    // Invalidate cache if api changes
    entriesCache.current = null;
  }, [api]);

  useEffect(() => {
    if (displayName && displayName.length > 0) {
      searchIdentity(displayName);
    } else {
      setResults([]);
    }
  }, [displayName, searchIdentity]);

  return { results, isLoading, error };
}
