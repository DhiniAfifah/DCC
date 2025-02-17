import Link from "next/link";
import type React from "react";
import { PlusCircle, FolderOpen } from "lucide-react";

const DccOptions = () => {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden p-4">
      {/* Background lebih terang: abu-abu ke biru muda */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-50 to-blue-200"></div>

      {/* Efek noise halus */}
      <div className="fixed inset-0 -z-10 bg-[url('/noise.png')] opacity-5"></div>

      <div className="flex flex-col space-y-6 w-full max-w-md z-20">
        <DccOption href="/create" icon={PlusCircle} color="green">
          DCC Generator
        </DccOption>
        <DccOption href="/load-dcc" icon={FolderOpen} color="blue">
          DCC Importer
        </DccOption>
      </div>
    </div>
  );
};

const DccOption = ({
  href,
  children,
  icon: Icon,
  color,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  color: "green" | "blue";
}) => {
  const colorClasses = {
    green:
      "from-green-400 to-green-500 hover:from-green-500 hover:to-green-600",
    blue: "from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600",
  };

  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-6 py-4 rounded-lg 
                  bg-gradient-to-r ${colorClasses[color]} text-white
                  shadow-md transform transition duration-300 ease-in-out
                  hover:scale-105 hover:shadow-lg backdrop-blur-sm`}
    >
      <span className="text-lg font-medium">{children}</span>
      <Icon className="w-7 h-7" />
    </Link>
  );
};

export default DccOptions;
