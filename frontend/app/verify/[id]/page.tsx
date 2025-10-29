"use client"

import { Verify } from "@/components/verify"

export default function VerifyPage() {
  return (
    <div className="bg-gradient-to-b from-white to-red-200 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 mt-20">
        <Verify />
      </div>
    </div>
  )
}