"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";

export function WalletBar() {
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const connectors = [...useConnectors()];
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== base.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const short =
    address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  const sheet =
    mounted && sheetOpen ? (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm"
        role="presentation"
        onClick={() => setSheetOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Connect wallet"
          className="w-full max-w-lg rounded-t-2xl border border-cyan-500/30 bg-[#0a0a12] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,245,255,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-sm uppercase tracking-widest text-cyan-300">
              Connect wallet
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="rounded px-2 py-1 text-white/60 hover:text-white"
              onClick={() => setSheetOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {connectors.length === 0 ? (
              <li className="py-4 text-center font-mono text-xs text-white/50">
                No wallets detected. Open in a wallet browser or install an
                extension.
              </li>
            ) : (
              connectors.map((connector) => (
                <li key={connector.uid}>
                  <button
                    type="button"
                    disabled={isConnecting}
                    className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/5 py-3 font-mono text-sm text-cyan-200 transition hover:bg-cyan-500/15 disabled:opacity-50"
                    onClick={() => {
                      connect({ connector, chainId: base.id });
                      setSheetOpen(false);
                    }}
                  >
                    {connector.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    ) : null;

  return (
    <>
      {wrongNetwork && (
        <div className="border-b border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center font-mono text-xs text-amber-200">
          Wrong network — switch to Base
          <button
            type="button"
            className="ml-2 underline"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
          >
            Switch
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="hidden font-mono text-[10px] text-cyan-400/80 sm:inline">
              {short}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-lg border border-fuchsia-500/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-fuchsia-300"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="neon-btn rounded-lg border border-cyan-400/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-cyan-300"
          >
            Connect wallet
          </button>
        )}
      </div>
      {sheet && createPortal(sheet, document.body)}
    </>
  );
}
