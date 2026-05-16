import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;
const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
  | Hex
  | undefined;

function resolveDataSuffix(): Hex | undefined {
  if (suffixOverride) return suffixOverride;
  if (!builderCode) return undefined;
  return Attribution.toDataSuffix({ codes: [builderCode] });
}

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({
      appName: "Neon Dig Dug",
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  dataSuffix: resolveDataSuffix(),
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
