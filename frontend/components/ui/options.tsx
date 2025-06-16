"use client";

import Link from "next/link";
import type React from "react";
import { PlusCircle, FolderOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const DccOptions = () => {
  const { t } = useLanguage();
  
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden pt-20">
      {/* Background lebih terang: abu-abu ke biru muda */}
      <>
        <div
          className="fixed inset-0 bg-cover bg-center filter grayscale"
          style={{ backgroundImage: "url('image/kelistrikan.jpg')" }}
        ></div>
        <div className="fixed inset-0 bg-red-200 bg-opacity-80 pointer-events-none"></div>
      </>

      {/* Efek noise halus */}
      <div className="fixed inset-0 -z-10 bg-[url('/noise.png')] opacity-5"></div>

      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 w-full z-20">
        <DccOption 
          href="/create" 
          icon={PlusCircle} 
          color="green"
          description={
            <span dangerouslySetInnerHTML={{ __html: t('generator') }} />
          }
        >
          DCC Generator
        </DccOption>
        <DccOption 
          href="/load-dcc" 
          icon={FolderOpen} 
          color="blue"
          description={
            <span dangerouslySetInnerHTML={{ __html: t('importer') }} />
          }
        >
          DCC Importer
        </DccOption>
      </div>
    </div>
  );
};

const DccOption = ({
  href,
  children,
  description,
  icon: Icon,
  color,
}: {
  href: string;
  children: React.ReactNode;
  description: React.ReactNode;
  icon: React.ElementType;
  color: "green" | "blue";
}) => {
  const colorClasses = {
    green:
      "from-green-500 to-green-700 hover:from-green-600 hover:to-green-800",
    blue: "from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700",
  };

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center aspect-square w-64
                  rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white
                  shadow-lg transform transition duration-300 ease-in-out
                  hover:scale-105 hover:shadow-xl backdrop-blur-sm text-center p-6`}
    >
      <Icon className="w-12 h-12 mb-3" />
      <span className="text-lg font-semibold">{children}</span>
      <span className="text-sm mt-2 opacity-90">{description}</span>
    </Link>
  );
};

export default DccOptions;