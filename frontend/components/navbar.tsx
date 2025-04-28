'use client';

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useLanguage } from '@/context/LanguageContext';
import { Switch } from "@/components/ui/switch"

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md shadow-black/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/image/BSN.png"
                alt="BSN logo"
                width={250}
                height={50}
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex space-x-4">
            {/* <NavLink href="/">Home</NavLink> */}
            <NavLink href="/about">About Us</NavLink>
            {/* <NavLink href="/contact" isContact>Contact Us</NavLink> */}
            
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({
  href,
  children,
  isContact = false,
}: {
  href: string;
  children: React.ReactNode;
  isContact?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`px-5 py-1.5 rounded-[50px] text-lg font-bold font-poopins transition duration-150 ease-in-out
        ${
          isContact
            ? "text-[#00AEED] border border-[#00AEED] hover:bg-[#00AEED] hover:text-white rounded-lg"
            : "text-violet-950 hover:text-violet-800"
        }`}
    >
      {children}
    </Link>
  );
};

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  const handleToggle = (checked: boolean) => {
    setLanguage(checked ? 'id' : 'en');
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="font-semibold text-violet-950">EN</span>
      <Switch
        checked={language === 'id'}
        onCheckedChange={handleToggle}
      />
      <span className="font-semibold text-violet-950">ID</span>
    </div>
  );
};

export default Navbar;
