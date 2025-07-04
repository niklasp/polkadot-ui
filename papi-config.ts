"use client";

import { dot, polkadotPeople } from "@polkadot-api/descriptors";
import type { TypedApi } from "polkadot-api";
import { chainSpec as polkadotChainSpec } from "polkadot-api/chains/polkadot";
import { chainSpec as polkadotPeopleChainSpec } from "polkadot-api/chains/polkadot_people";

export interface ChainSpec {
  name: string;
  id: string;
  chainType: string;
  bootNodes: string[];
  telemetryEndpoints: string[];
  protocolId: string;
  properties: {
    tokenDecimals: number;
    tokenSymbol: string;
  };
  relay_chain: string;
  para_id: number;
  codeSubstitutes: Record<string, string>;
  genesis: {
    stateRootHash: string;
  };
  relayChainSpec?: ChainSpec;
}
export interface ChainConfig {
  key: string;
  name: string;
  descriptors: typeof dot | typeof polkadotPeople;
  endpoints?: string[];
  explorerUrl?: string;
  icon?: React.ReactNode;
  chainSpec: ChainSpec;
  relayChainSpec?: ChainSpec;
}

export type AvailableApis<T extends ChainConfig> = TypedApi<T["descriptors"]>;

// TODO: add all chains your dapp supports here
export const chainConfig: ChainConfig[] = [
  {
    key: "polkadot-peoples-network",
    name: "Polkadot People Chain",
    descriptors: polkadotPeople,
    chainSpec: JSON.parse(polkadotPeopleChainSpec),
    relayChainSpec: JSON.parse(polkadotChainSpec),
  },
  {
    key: "polkadot",
    name: "Polkadot",
    descriptors: dot,
    endpoints: ["wss://rpc.polkadot.io"],
    chainSpec: JSON.parse(polkadotChainSpec),
  },
];
