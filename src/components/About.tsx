import Image from "next/image";

export default function About() {
    return (
        <section id="about" className="section-container flex flex-col md:flex-row items-center gap-24 pt-32 pb-20">
            <div className="flex-1">
                <div className="w-full aspect-square max-w-[420px] bg-white rounded-[24px] shadow-[0px_110px_88px_-2.25px_rgba(0,0,0,0.07)] flex items-center justify-center p-8 border border-gray-50 group">
                    <div className="w-full h-full bg-[#FFFFFF] rounded-[24px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <div className="relative w-full h-full p-12 transition-transform duration-500 group-hover:scale-110">
                            <Image
                                src="/assets/images/about_gift.png"
                                alt="Starknet Gift Illustration"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-8">
                <span className="text-[11.6px] font-bold tracking-widest text-[#FF6830] uppercase">STARKNET POWERED</span>
                <h2 className="heading-2 !text-left !justify-start">About Us</h2>
                <div className="space-y-6">
                    <p className="text-[18px] text-[#121212] leading-[29px] font-bold">
                        Room is a decentralized video meeting platform that lets people connect through high-quality audio and video while staying in control of their data and assets.
                    </p>
                    <p className="text-[15.1px] text-[#545454] leading-[24px] font-normal">
                        Unlike traditional meeting tools, Room is built on decentralized infrastructure and enables users to send tokens live during calls — directly from wallet to wallet. Room is designed for creators, communities, teams, and anyone who believes communication should be easy, secure, and transparent.
                    </p>
                </div>
                <div className="flex items-center gap-4 pt-4">
                    <button className="pill-button-primary w-[164px]">Learn More</button>
                    <button className="pill-button-secondary w-[147px]">Contact Us</button>
                </div>
            </div>
        </section>
    );
}
