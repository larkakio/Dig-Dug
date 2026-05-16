import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** Builder code from base.dev → Settings → Builder Codes */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_2mlps8p4";

const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
  | Hex
  | undefined;

/**
 * ERC-8021 data suffix for all wagmi transactions (check-in, etc.).
 * Uses `bc_…` via ox — never pass raw hex unless using BUILDER_CODE_SUFFIX override.
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export function getBuilderDataSuffix(): Hex | undefined {
  if (suffixOverride) return suffixOverride;
  if (!BUILDER_CODE) return undefined;
  return Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
}
