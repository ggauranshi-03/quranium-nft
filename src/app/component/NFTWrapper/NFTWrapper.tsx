"use client";

import { useQsafeQL1FullInfo } from "@/hooks/useQsafeQL1FullInfo";
import NFTComponent from "../NFT/NFT";

export default function NFTWrapper() {
  const { address, isConnected } = useQsafeQL1FullInfo();

  return <NFTComponent userAddress={isConnected ? address : null} />;
}
