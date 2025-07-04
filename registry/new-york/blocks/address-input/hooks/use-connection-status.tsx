"use client";

import { useLightClientApi } from "@/providers/polkadot-lightclient-api-provider";
import { WsEvent } from "polkadot-api/ws-provider/web";
import { useEffect, useState } from "react";
import { useBlockNumber } from "./use-block-number";

export function useConnectionStatus() {
  const { connectionStatus } = useLightClientApi();
  const blockNumber = useBlockNumber();
  const [status, setStatus] = useState<WsEvent>(WsEvent.CONNECTING);

  useEffect(() => {
    if (connectionStatus?.type === WsEvent.CONNECTED && blockNumber) {
      console.log("connected", blockNumber);
      setStatus(WsEvent.CONNECTED);
    } else if (
      connectionStatus?.type === WsEvent.CONNECTING ||
      (connectionStatus?.type === WsEvent.CONNECTED && !blockNumber)
    ) {
      setStatus(WsEvent.CONNECTING);
    } else {
      setStatus(WsEvent.ERROR);
    }
  }, [connectionStatus, blockNumber]);

  return status;
}
