"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function About() {
    const { t } = useLanguage();

    return (
        <div className="mt-16">
            <div className="relative w-full h-[200px]">
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat filter grayscale"
                    style={{
                    backgroundImage: "url('image/about.png')",
                    backgroundPosition: '0% 37%',
                    }}
                ></div>
                <div className="absolute inset-0 bg-indigo-900 bg-opacity-80"></div>

                <div className="relative z-10 flex items-center justify-center h-full">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">{t("about_us")}</h1>
                </div>
            </div>
            
            <div className="mx-20 mt-8 text-sm">
                <span dangerouslySetInnerHTML={{ __html: t("about_content") }} />
            </div>
        </div>
    );
}