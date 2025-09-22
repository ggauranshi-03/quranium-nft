"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReload = () => {
    reset();
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-2 text-lg">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mb-4 text-sm text-gray-400">Error code: {error.digest}</p>
      )}
      <button
        onClick={handleReload}
        className="md:flex items-center justify-center gap-2 hidden w-auto h-auto px-5 py-3 rounded-full font-montserrat"
      >
        Reload Page
      </button>
    </div>
  );
}
