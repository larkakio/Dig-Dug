"use client";

import { checkInAbi, CHECK_IN_ADDRESS } from "@/lib/contracts/checkInAbi";
import { useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";

export function CheckInChip() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const hasContract =
    CHECK_IN_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: canCheckIn, refetch } = useReadContract({
    address: CHECK_IN_ADDRESS,
    abi: checkInAbi,
    functionName: "canCheckIn",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address && hasContract),
    },
  });

  const handleCheckIn = useCallback(async () => {
    if (!isConnected || !address || !hasContract) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    await writeContractAsync({
      address: CHECK_IN_ADDRESS,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
    });
    refetch();
  }, [
    address,
    chainId,
    hasContract,
    isConnected,
    refetch,
    switchChainAsync,
    writeContractAsync,
  ]);

  if (!hasContract) return null;

  const synced = canCheckIn === false;
  const disabled =
    !isConnected || synced || isWriting || isSwitching;

  let label = "Daily sync";
  if (!isConnected) label = "Connect first";
  else if (synced) label = "Synced";
  else if (isWriting || isSwitching) label = "Syncing…";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleCheckIn}
      className="rounded-lg border border-lime-400/50 bg-lime-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
      title="On-chain daily check-in on Base (gas only)"
    >
      {label}
    </button>
  );
}
