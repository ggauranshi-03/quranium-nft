"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import AppContent from "./AppContent";

const queryClient = new QueryClient();

const Provider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent>{children}</AppContent>
    </QueryClientProvider>
  );
};

export default Provider;
