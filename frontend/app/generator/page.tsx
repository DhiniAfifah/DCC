"use client";

import LabButtons from "@/components/ui/lab-buttons";
import {
  Zap,
  Thermometer,
  Timer,
  Lightbulb,
  FlaskConical,
  Ruler,
  Weight,
  AudioWaveform,
  Radiation,
  Microscope,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import DashboardClient from "./DashboardClient";

type Lab = {
    href: string;
    icon: React.ElementType;
    color: "orange" | "red" | "indigo" | "purple" | "green" | "blue" | "gray" | "lime" | "yellow" | "pink";
    label: string;
};

export default function Generator() {
    const { t } = useLanguage();

    const labs: Lab[] = [
        { href: "/generator/electrical", icon: Zap, color: "orange", label: "listrik" },
        { href: "/generator/temperature", icon: Thermometer, color: "red", label: "suhu" },
        { href: "/generator", icon: Timer, color: "indigo", label: "waktu" },
        { href: "/generator", icon: Lightbulb, color: "purple", label: "fotometri_radiometri" },
        { href: "/generator", icon: FlaskConical, color: "green", label: "kimia" },
        { href: "/generator", icon: Ruler, color: "blue", label: "panjang" },
        { href: "/generator", icon: Weight, color: "gray", label: "massa" },
        { href: "/generator", icon: AudioWaveform, color: "lime", label: "akustik_vibrasi" },
        { href: "/generator", icon: Radiation, color: "yellow", label: "radiasi" },
        { href: "/generator", icon: Microscope, color: "pink", label: "biologi" },
    ];

    return (
        <div className="mt-20">
            <div id="background" className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-green-100"></div>

            <div id="lab-buttons" className="pt-8 py-4 flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {labs.map(({ href, icon, color, label }) => (
                    <LabButtons key={label} href={href} icon={icon} color={color}>
                    {t(label)}
                    </LabButtons>
                ))}
                </div>
            </div>

            <div id="table" className="flex justify-center mb-8">
                <DashboardClient />
            </div>
        </div>
    );
}