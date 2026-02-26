"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-6">
            <div className="navbar-mesh-gradient" />
            <div className="w-full max-w-[1221px] flex justify-between items-center h-[49px]">
                <div className="flex items-center gap-2">
                    <div className="w-[33px] h-[34px] flex items-center justify-center">
                        <Image
                            src="/assets/logos/logo.png"
                            alt="Room Logo"
                            width={33}
                            height={34}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-[23.2px] font-bold tracking-[-1.76px] text-[#121212]">Room</span>
                </div>

                <div className="hidden md:flex items-center gap-[26px]">
                    <Link href="#about" className="text-[15px] font-bold text-[#121212] hover:opacity-70 transition-opacity">About</Link>
                    <Link href="#services" className="text-[15px] font-bold text-[#121212] hover:opacity-70 transition-opacity">Services</Link>
                    <Link href="#faqs" className="text-[15px] font-bold text-[#121212] hover:opacity-70 transition-opacity">FAQs</Link>
                </div>

                <Link href="/app" className="pill-button-secondary bg-white whitespace-nowrap min-w-[140px] border-[#D1D1D1] flex items-center justify-center">
                    Launch app
                </Link>
            </div>
        </nav>
    );
}
