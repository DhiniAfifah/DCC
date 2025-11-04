"use client";

import About from "@/components/about";
import { useEffect } from "react";

export default function LoginPage() {
    useEffect(() => {
        document.title = "About | DiCCA";
    }, []);

    return (
        <About />
    );
}