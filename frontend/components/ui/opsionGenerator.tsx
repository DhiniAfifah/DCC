import Link from "next/link";
import type React from "react";

const OpsionGenerator = () => {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden p-4">
      {/* Background resmi: gradient abu-abu ke navy */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-100 to-blue-900"></div>

      <div className="fixed inset-0 -z-10 bg-[url('/noise.png')] opacity-10"></div>

      <div className="flex flex-col space-y-6 w-full max-w-md z-20">
        <DccOption href="/create/form">Create new DCC</DccOption>
        <DccOption href="/load">Load existing DCC</DccOption>
      </div>
    </div>
  );
};

const DccOption = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-center px-6 py-4 rounded-[30px]  
                 border-2 border-black text-black text-xl font-semibold
                 transition duration-300 ease-in-out transform
                 hover:bg-black hover:text-white"
    >
      <span>{children}</span>
    </Link>
  );
};

export default OpsionGenerator;
