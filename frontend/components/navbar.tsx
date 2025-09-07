'use client';

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useLanguage } from '@/context/LanguageContext';
import { Switch } from "@/components/ui/switch";
import { logout, isDirector, isAuthenticated } from "@/utils/auth";
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { House } from 'lucide-react';

const Navbar = () => {
  const { t } = useLanguage();
  const [userIsDirector, setUserIsDirector] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check user role on component mount and when auth state changes
  useEffect(() => {
    const checkUserRole = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const directorStatus = isDirector();
        setUserIsDirector(directorStatus);
        console.log("🔍 Navbar: User is director:", directorStatus);
      } else {
        setUserIsDirector(false);
      }
    };

    // Initial check
    checkUserRole();

    // Set up interval to check auth status periodically
    const interval = setInterval(checkUserRole, 5000); // Check every 5 seconds

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkUserRole();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("🚪 Navbar: Logout clicked");
    
    try {
      await logout();
    } catch (error) {
      console.error("❌ Navbar: Logout failed:", error);
      // Force redirect anyway
      window.location.href = "/";
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md shadow-black/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20 space-x-6">
          <Image
            src="/image/BSN.png"
            alt="BSN logo"
            width={250}
            height={50}
          />
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <NavLink href="/home"><House /></NavLink>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-5 py-1.5 rounded-[50px] text-lg font-bold font-poopins transition duration-150 ease-in-out text-indigo-950 hover:text-indigo-800"
              >
                {t("logout")}
              </button>
            )}
            {!isLoggedIn && (
              <NavLink href="/">{t("login")}</NavLink>
            )}
            
            {/* Dashboard button - only visible for directors */}
            {isLoggedIn && userIsDirector && (
              <NavLink href="/dashboard" isDashboard={true}>
                {t("dasbor")}
              </NavLink>
            )}
            
            <NavLink href="/about">{t("about")}</NavLink>
            
            <LanguageSwitch />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Menu className="w-6 h-6 text-indigo-950" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/home">
                    {t("home")}
                  </Link>
                </DropdownMenuItem>

                {isLoggedIn && userIsDirector && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}

                {!isLoggedIn && (
                  <DropdownMenuItem asChild>
                    <Link href="/">{t("login")}</Link>
                  </DropdownMenuItem>
                )}
                {isLoggedIn && (
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("logout")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/about">{t("about")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
  isDashboard = false,
}: {
  href: string;
  children: React.ReactNode;
  isContact?: boolean;
  isDashboard?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`px-5 py-1.5 rounded-[50px] text-lg font-bold font-poopins transition duration-150 ease-in-out
        ${
          isContact
            ? "text-[#00AEED] border border-[#00AEED] hover:bg-[#00AEED] hover:text-white rounded-lg"
            : "text-indigo-950 hover:text-indigo-800"
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
      <span className="font-semibold text-indigo-950">EN</span>
      <Switch
        checked={language === 'id'}
        onCheckedChange={handleToggle}
      />
      <span className="font-semibold text-indigo-950">ID</span>
    </div>
  );
};

export default Navbar;