import { Check, Copy } from "lucide-react";
import React from "react";

const CopyButton = ({ referralLink, setCopied, copied }) => {
  return (
    <button
      className="w-fit h-fit p-0 cursor-pointer hover:bg-transparent hover:shadow-none hover:border-none"
      onClick={() => {
        navigator.clipboard.writeText(referralLink || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-5 h-5 " /> : <Copy className="w-5 h-5" />}
    </button>
  );
};

export default CopyButton;
