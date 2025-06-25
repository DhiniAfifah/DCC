"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function About() {
    const { t } = useLanguage();

    return (
        <div className="pt-20">
            <div className="relative w-full h-[70px] md:h-[140px] lg:h-[200px]">
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat filter grayscale"
                    style={{
                    backgroundImage: "url('image/SNSU.jpg')",
                    backgroundPosition: '0% 37%',
                    }}
                ></div>
                <div className="absolute inset-0 bg-indigo-900 bg-opacity-80"></div>

                <div className="relative z-10 flex items-center justify-center h-full">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">{t("about_us")}</h1>
                </div>
            </div>
            
            <div className="mx-10 md:mx-20 my-8 text-xs md:text-sm">
                <span dangerouslySetInnerHTML={{ __html: t("about_content") }} />
            </div>
        </div>
    );
}