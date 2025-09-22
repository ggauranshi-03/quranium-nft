"use client";

import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";

import { ThemeProvider } from "@/components/ui/theme-provider";
import NavBar from "../Common/Navbar/navbar";

const AppContent = ({ children }) => {
  return (
    <ThemeProvider
      defaultTheme="dark"
      attribute="class"
      disableTransitionOnChange
    >
      <ToastContainer position="top-right" autoClose={5000} />
      <NavBar />
      <div className="flex flex-row w-full relative">
        <motion.div
          className="flex flex-col flex-grow ml-0 md:ml-20 max-w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-4"
          >
            {children}
          </motion.main>
        </motion.div>
      </div>
    </ThemeProvider>
  );
};

export default AppContent;
