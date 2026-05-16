import { getBuilderDataSuffix } from "@/lib/builder/attribution";
import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

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
  /** Auto-append Builder Code to every transaction (ERC-8021). */
  dataSuffix: getBuilderDataSuffix(),
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
