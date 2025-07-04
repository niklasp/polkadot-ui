import { decodeAddress } from "@polkadot/util-crypto";

/**
 * Checks if a string is a structurally valid SS58 address.
 * This checks the format and checksum but doesn't guarantee
 * it belongs to a specific network unless you use
 * isValidSS58AddressForNetwork.
 *
 * @param address The string to test.
 * @returns True if the string is a valid SS58 address, false otherwise.
 */
export function isSS58Address(address: string | null | undefined): boolean {
  if (!address) {
    return false;
  }
  try {
    decodeAddress(address);
    return true;
  } catch (error) {
    // If decodeAddress throws an error, it's not a valid SS58 address
    return false;
  }
}

export function apiHasIdentity(api: any) {
  return (
    api.query.Identity &&
    api.query.Identity.IdentityOf &&
    typeof api.query.Identity.IdentityOf.getEntries === "function"
  );
}
