import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative pt-32 pb-10 px-6 overflow-hidden bg-white/30 border-t border-gray-100">
            <div className="w-full max-w-[1221px] mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-32">
                    <div className="space-y-6 max-w-[340px]">
                        <div className="flex items-center gap-2">
                            <div className="w-[33px] h-[34px] flex items-center justify-center">
                                <Image
                                    src="/assets/images/logo_footer.png"
                                    alt="Room Logo"
                                    width={33}
                                    height={34}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-[23.2px] font-bold tracking-[-1.76px] text-[#121212]">Room</span>
                        </div>
                        <p className="text-[#545454] text-[15.1px] font-normal leading-[24px]">
                            Find out what's possible when work connects. The future of video collaboration on Starknet.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-20">
                        <div className="space-y-4">
                            <p className="text-[14px] font-bold text-[#121212] mb-6">Menu</p>
                            <Link href="#about" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">About</Link>
                            <Link href="#services" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">Services</Link>
                            <Link href="#faqs" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">FAQs</Link>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[14px] font-bold text-[#121212] mb-6">Connect</p>
                            <Link href="#" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">X-Twitter</Link>
                            <Link href="#" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">YouTube</Link>
                            <Link href="#" className="block text-[#545454] hover:text-[#121212] font-bold transition-colors text-[14.8px]">Instagram</Link>
                        </div>
                    </div>
                </div>

                <div className="relative py-20 flex justify-center items-center overflow-hidden">
                    <h2 className="text-[25rem] font-bold text-[#121212]/[0.03] text-center leading-none tracking-[-18px] select-none uppercase">
                        Room
                    </h2>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-100 text-[13px] text-[#545454]">
                    <p>© 2026 Room. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
