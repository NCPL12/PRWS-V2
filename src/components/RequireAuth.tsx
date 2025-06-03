
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username || !role) {
      router.push("/");
    }
  }, []);

  return <>{children}</>;
}
