"use client";

import { useAuth } from "@/app/hooks/UseAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IsDesktop } from "@/app/hooks";

const HomePage: React.FC = () => {
  const auth = useAuth();
  const navigation = useRouter();
  const isDesktop = IsDesktop();

  useEffect(() => {
    if (!auth.auth.isAuthenticated) {
      navigation.replace("/auth/login");
      return;
    }
  }, [auth.auth.isAuthenticated, navigation]);

  if (!auth.auth.isAuthenticated) {
    return null; // Hindari rendering konten saat redirect
  }

  return !isDesktop ? null : (
    <div className="w-full flex flex-col justify-center items-center gap-5 font-poppins relative z-0">
      testing home page
    </div>
  );
};

export default HomePage;
