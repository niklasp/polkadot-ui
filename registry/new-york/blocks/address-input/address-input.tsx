"use client";

import { useState, ChangeEvent, Suspense, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import Identicon from "@polkadot/react-identicon";

import { z } from "zod";
import { isSS58Address } from "./util";
import { useIdentity } from "./hooks/use-identity";
import { useIdentityByDisplayName } from "./hooks/use-identity-by-display-name";
import { CircleCheck } from "lucide-react";
import { useConnectionStatus } from "./hooks/use-connection-status";
import { useBlockNumber } from "./hooks/use-block-number";
import { ConnectionStatusIndicator } from "@/components/connection-status-indicator";

const addressInputSchema = z.object({
  address: z.string().refine(isSS58Address, {
    message: "Invalid SS58 address",
  }),
});

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function AddressInput({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const connectionStatus = useConnectionStatus();
  const blockNumber = useBlockNumber();
  const [address, setAddress] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedInput = useDebouncedValue(address, 500);
  const isAddress = isSS58Address(debouncedInput);
  const {
    identity,
    isLoading,
    error: identityError,
  } = useIdentity(isAddress ? debouncedInput : null);
  const {
    results: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useIdentityByDisplayName(
    !isAddress && debouncedInput.length > 2 ? debouncedInput : null
  );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
    setError(null);
    setShowDropdown(false);
    onChange?.(e.target.value);
  }

  function handleBlur() {
    const result = addressInputSchema.safeParse({ address });
    if (!result.success && isSS58Address(address)) {
      setError(result.error.errors[0].message);
    } else {
      setError(null);
    }
    setTimeout(() => setShowDropdown(false), 150);
  }

  function handleFocus() {
    if (!isAddress && debouncedInput.length > 2 && searchResults.length > 0)
      setShowDropdown(true);
  }

  function handleSelect(address: string | undefined | null) {
    setAddress(address ?? "");
    setShowDropdown(false);
    inputRef.current?.blur();
  }

  useEffect(() => {
    if (!isAddress && debouncedInput.length > 2 && searchResults.length > 0)
      setShowDropdown(true);
    else setShowDropdown(false);
  }, [debouncedInput, isAddress, searchResults]);

  return (
    <div
      className={cn(
        "relative grid w-full max-w-sm items-center gap-1.5",
        className
      )}
    >
      <Label htmlFor="address">Address</Label>
      {/* Search Results Debug: <pre>{JSON.stringify(searchResults, null, 2)}</pre> */}
      <div className="relative flex w-full items-center gap-2">
        <ConnectionStatusIndicator
          status={connectionStatus}
          className="absolute -left-0.5 -top-0.5"
        />
        <Input
          id="address"
          ref={inputRef}
          value={address ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-invalid={!!error}
          aria-describedby={error ? "address-error" : undefined}
          placeholder="Enter a SS58 address or account name"
          className="flex-1 min-w-0"
          autoComplete="off"
        />
        {identity && isAddress && !error && (
          <span className="text-muted-foreground font-medium text-sm max-w-2/3 truncate flex-shrink-0 flex items-center gap-1">
            <Identicon value={address} size={16} theme="polkadot" />
            {identity}
            <CircleCheck className="w-4 h-4 stroke-2 stroke-white fill-green-600" />
          </span>
        )}
        {showDropdown && !isAddress && debouncedInput.length > 2 && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {isSearching && (
              <div className="p-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {searchError && (
              <div className="p-2 text-sm text-destructive">
                {searchError.message}
              </div>
            )}
            {!isSearching &&
              !searchError &&
              searchResults.length > 0 &&
              searchResults.map((result) => (
                <button
                  key={result.address}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent focus:outline-none flex items-center gap-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(result.address)}
                >
                  <div className="w-1/2 flex items-center gap-2">
                    <Identicon
                      value={result.address}
                      size={20}
                      theme="polkadot"
                    />
                    <span className="text-sm font-medium truncate whitespace-nowrap overflow-hidden">
                      {result.identity.display}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {result.address}
                  </span>
                </button>
              ))}
            {!isSearching && !searchError && searchResults.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p
          id="address-error"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      {isLoading && isAddress && (
        <p className="text-sm text-muted-foreground">Loading identity...</p>
      )}
      {identityError && (
        <p className="text-sm text-destructive">{identityError.message}</p>
      )}
      {!isLoading &&
        isAddress &&
        !identity &&
        address &&
        !error &&
        !identityError && (
          <p className="text-sm text-muted-foreground">
            No identity set for this address.
          </p>
        )}
    </div>
  );
}
