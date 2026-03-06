import { Play } from "lucide-react";

import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative pt-[120px] pb-[80px] px-6 flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-[1221px] flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 max-w-[640px]">
                    <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                        <div className="w-2 h-2 rounded-full bg-[#10F110] shadow-[0_0_10px_#10F110]" />
                        <span className="text-[12px] font-bold tracking-[0.15em] text-[#121212]/60 uppercase">Starknet Native</span>
                    </div>

                    <h1 className="text-[40px] md:text-[82px] font-bold leading-[1.1] md:leading-[0.95] tracking-[-0.04em] text-[#121212] mb-6 md:mb-8 text-center md:text-left">
                        Build, Learn, and Collaborate in One Room
                    </h1>

                    <p className="text-[16px] md:text-[18px] leading-[1.6] text-[#121212]/60 max-w-[380px] mb-8 md:mb-10 text-center md:text-left mx-auto md:mx-0">
                        Bring builders, learners, and communities together. Host hackathons, run classes, collaborate live, and reward participants instantly with STRK through seamless wallet connections on StarkNet.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start w-full sm:w-auto px-4 sm:px-0">
                        <button className="pill-button-primary bg-[#121212] text-white w-full sm:w-auto">
                            Get started
                        </button>
                        <button className="pill-button-secondary bg-white text-[#121212] border-[#D1D1D1] flex items-center gap-2 w-full sm:w-auto justify-center">
                            <div className="w-[18px] h-[18px] relative">
                                <Image
                                    src="/assets/images/icon_play.png"
                                    alt="Play icon"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            Watch demo
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative w-full h-[320px] md:h-[473px] max-w-[585px] bg-[rgba(255,255,255,0.4)] md:rounded-[24px] rounded-[16px] md:shadow-[0px_110px_88px_-2.25px_rgba(0,0,0,0.07)] p-2 md:p-4 mt-8 md:mt-0">
                    <div className="w-full h-full bg-gray-100 md:rounded-[20px] rounded-[12px] overflow-hidden relative">
                        <Image
                            src="/assets/images/hero_image.jpg"
                            alt="Meeting Experience"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
