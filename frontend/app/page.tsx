"use client";
import Login from "@/components/login";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, verifyToken } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (token && verifyToken(token)) {
      router.push("/main");
    }
  }, [router]);

  return (
    <div className="bg-gradient-to-b from-white to-indigo-200 flex min-h-svh flex-col items-center justify-center pt-20">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Login formData={{ email: "", password: "" }} />
      </div>
    </div>
  );
}
