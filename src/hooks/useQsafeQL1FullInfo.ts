"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

declare global {
  interface Window {
    qsafe?: {
      providers?: {
        ethereum?: any;
        ql1evm?: any;
      };
    };
  }
}

export function useQsafeQL1FullInfo() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [clientVersion, setClientVersion] = useState<string | null>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ new loading state

  const fetchData = async (address: string, provider: any) => {
    try {
      const [balanceHex, chainIdHex, gasPriceHex, clientVer, txCountHex] =
        await Promise.all([
          provider.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          }),
          provider.request({ method: "eth_chainId" }),
          provider.request({ method: "eth_gasPrice" }),
          provider.request({ method: "web3_clientVersion" }),
          provider.request({
            method: "eth_getTransactionCount",
            params: [address, "latest"],
          }),
        ]);

      setBalance(formatEther(BigInt(balanceHex)));
      setChainId(parseInt(chainIdHex, 16));
      setGasPrice(formatEther(BigInt(gasPriceHex)));
      setClientVersion(clientVer);
      setTxCount(parseInt(txCountHex, 16));
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    }
  };

  const connect = async () => {
    setIsLoading(true); // ✅ set loading at start
    let provider = window?.qsafe?.providers?.ethereum;
    if (provider && typeof provider.request === "function") {
      try {
        let accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        const addr = accounts?.[0] || accounts?.address;
        setAddress(addr);
        await fetchData(addr, provider);
        setIsLoading(false); // ✅ done loading
        return addr;
      } catch (err) {
        console.error("Qsafe connection error:", err);
        setIsLoading(false); // ✅ done even on error
      }
    }
  };

  const disconnect = async () => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setGasPrice(null);
    setClientVersion(null);
    setTxCount(null);
    await window.qsafe.providers.ql1evm.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  };

  useEffect(() => {
    const provider = window?.qsafe?.providers?.ethereum;
    if (provider && typeof provider.request === "function") {
      provider
        .request({ method: "eth_accounts" })
        .then(async (accounts) => {
          if (accounts?.length > 0) {
            const addr = accounts[0];
            setAddress(addr);
            await fetchData(addr, provider);
          }
        })
        .catch((err) => {
          console.error("Error fetching accounts:", err);
        });
    } else {
      console.warn(
        "Qsafe provider not available or does not support eth_accounts"
      );
    }

    const init = async () => {
      setIsLoading(true);
      const browserProvider = new ethers.BrowserProvider(
        window.qsafe?.providers.ethereum
      );

      let chainId: string;
      try {
        const expectedQuraniumChainId = "0x3dfb48";

        try {
          await browserProvider.send("wallet_addEthereumChain", [
            {
              chainId: expectedQuraniumChainId,
              chainName: "Quranium Testnet",
              rpcUrls: ["https://tqrn-node1.quranium.org/node"],
              nativeCurrency: {
                name: "Quranium",
                symbol: "QRN",
                decimals: 18,
              },
            },
          ]);
          // Update chainId after successful switch
          chainId = expectedQuraniumChainId;
        } catch (addError: any) {
          console.warn("Failed to add Quranium chain (optional):", addError);
          console.log(
            `Continuing with chain ${chainId} as EVM-compatible provider`
          );
        }
      } catch (error: any) {
        console.error(
          "Failed to fetch chainId from QSafe provider:",
          error.message
        );
        chainId = this.chainIdFromResponse ?? "0x3dfb48"; // Fallback to Quranium chainId on error
      }

      setIsLoading(false);
    };

    init();
  }, []);

  return {
    address,
    balance,
    chainId,
    gasPrice,
    clientVersion,
    txCount,
    connect,
    disconnect,
    isConnected: !!address,
    isLoading,
  };
}
