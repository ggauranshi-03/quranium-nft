"use client";
import React from "react";

import ConnectButton from "../ConnectButton/ConnectButton";

const NavBar: React.FunctionComponent = () => {
  return (
    <nav className="flex flex-row w-full sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#C9C9C980] p-2 shadow-sm justify-between">
      <ConnectButton />
    </nav>
  );
};

export default NavBar;
