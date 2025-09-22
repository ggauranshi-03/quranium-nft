"use client";

import React, { useState } from "react";

import { Wallet2Icon } from "lucide-react";

import { useQsafeQL1FullInfo } from "@/hooks/useQsafeQL1FullInfo";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  disconnectStep,
  qsafeExtension,
} from "../../../../../public/assests/wallet";

const ConnectButton = () => {
  const { address, isConnected, connect } = useQsafeQL1FullInfo();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    try {
      connect();

      // const address = await connect();
      // await createWalletCookies(address);
      window.location.reload();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <div className="block">
      {isConnected && address?.length ? (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <button
              className="hidden md:block"
              onClick={() => setShowModal(true)}
            >
              {`${address.slice(0, 4)}...${address.slice(-4)}`}
            </button>
          </DialogTrigger>

          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>You&apos;re Connected</DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                Follow these steps to disconnect your wallet manually:
              </DialogDescription>
            </DialogHeader>

            <Image src={qsafeExtension} alt="qsafe extension step" />
            <Image src={disconnectStep} alt="disconnect step" />

            <DialogClose asChild>
              <button className="mt-4 w-full">Got it</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      ) : (
        <div>
          {/* Desktop View */}
          <button
            onClick={handleConnect}
            className="md:flex items-center justify-center gap-2 hidden w-auto h-auto px-5 py-3 rounded-full font-montserrat"
          >
            Connect Wallet
            <Wallet2Icon className="w-5 h-5" />
          </button>

          {/* Mobile View */}
          <button
            onClick={handleConnect}
            className="flex md:hidden items-center justify-center w-18 h-12 rounded-full font-montserrat"
          >
            <Wallet2Icon className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
