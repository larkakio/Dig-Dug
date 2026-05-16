import { GameShell } from "@/components/game/GameShell";
import { CheckInChip } from "@/components/wallet/CheckInChip";
import { WalletBar } from "@/components/wallet/WalletBar";

export default function Home() {
  return (
    <div className="flex min-h-dvh max-h-dvh flex-col">
      <header className="relative z-30 shrink-0 border-b border-cyan-500/20 bg-black/60 px-3 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-lime-300 neon-title">
              Neon Dig Dug
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">
              Base · Cybergrid
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckInChip />
            <WalletBar />
          </div>
        </div>
      </header>
      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-30" />
        <GameShell />
      </main>
    </div>
  );
}
