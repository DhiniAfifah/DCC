"use client";

import Link from "next/link";
import type React from "react";
import clsx from "clsx";

type LabButtonProps = {
    href: string;
    children: React.ReactNode;
    icon: React.ElementType;
    color: "orange" | "red" | "indigo" | "purple" | "green" | "blue" | "gray" | "lime" | "yellow" | "pink";
};

const colorClasses: Record<LabButtonProps["color"], string> = {
    orange: "from-orange-300 to-orange-500 hover:from-orange-400 hover:to-orange-600",
    red: "from-red-500 to-red-700 hover:from-red-600 hover:to-red-800",
    indigo: "from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950",
    purple: "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800",
    green: "from-green-500 to-green-700 hover:from-green-600 hover:to-green-800",
    blue: "from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700",
    gray: "from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800",
    lime: "from-lime-400 to-lime-600 hover:from-lime-500 hover:to-lime-700",
    yellow: "from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600",
    pink: "from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700",
};

const LabButtons = ({ href, children, icon: Icon, color }: LabButtonProps) => {
    return (
        <Link
            href={href}
            className={clsx(
                "flex flex-col items-center justify-center aspect-square w-44 rounded-2xl",
                "bg-gradient-to-br text-white shadow-lg transform transition duration-300 ease-in-out",
                "hover:scale-105 hover:shadow-xl backdrop-blur-sm text-center p-6",
                colorClasses[color]
            )}
        >
            <Icon className="w-12 h-12 mb-3" />
            <span className="text-lg font-bold">{children}</span>
        </Link>
    );
};

export default LabButtons;