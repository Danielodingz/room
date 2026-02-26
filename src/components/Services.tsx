import Image from "next/image";

export default function Services() {
    return (
        <section id="services" className="section-container pt-32 pb-20">
            <div className="mb-20 space-y-4">
                <span className="text-[11.6px] font-bold tracking-widest text-[#FF6830] uppercase block text-center">SERVICES</span>
                <h2 className="heading-2 max-w-[786px] mx-auto">
                    One platform. <br /> Endless ways to work together.
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-[24px] shadow-[0px_50px_35px_-1.5px_rgba(0,0,0,0.08)] p-10 h-[389px] relative overflow-hidden group">
                    <div className="absolute inset-[15px] bg-[#121212] rounded-[20px] overflow-hidden">
                        <Image
                            src="/assets/images/service_video_call.png"
                            alt="Video call experience"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-10 left-10 text-white space-y-2">
                            <div className="flex gap-2">
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
                                <div className="w-6 h-1 bg-white/10 rounded-full" />
                            </div>
                            <h3 className="text-[25.8px] font-bold tracking-tight">Video call experience</h3>
                            <p className="text-[14.6px] opacity-70">Live Room</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#121212] rounded-[24px] shadow-[0px_50px_35px_-1.5px_rgba(0,0,0,0.08)] p-8 h-[389px] flex flex-col justify-end relative overflow-hidden group">
                    <Image
                        src="/assets/images/service_short_form.jpg"
                        alt="Short-form edits"
                        fill
                        className="object-cover opacity-60"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                    <div className="relative z-10 text-white space-y-4">
                        <h3 className="text-[33px] font-bold leading-none tracking-tight">Short-form edits</h3>
                        <p className="text-[14.8px] opacity-70">Built to stop the scroll and multiply engagement.</p>
                    </div>
                </div>

                <div className="md:col-span-2 bg-[#121212] rounded-[24px] shadow-[0px_50px_35px_-1.5px_rgba(0,0,0,0.08)] h-[175px] relative overflow-hidden group">
                    <div className="absolute inset-0 p-10 flex flex-col justify-center z-10 pointer-events-none">
                        <div className="max-w-[400px] space-y-2 pointer-events-auto">
                            <h3 className="text-[22.8px] font-bold text-white">Send Token Gifts</h3>
                            <p className="text-[12.6px] text-white opacity-70">Creating high-quality visuals as clicks starts before the video plays.</p>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-[350px] pointer-events-none">
                        <Image
                            src="/assets/images/service_token_gifts.png"
                            alt="Token Gifts"
                            fill
                            className="object-contain object-right scale-[1.1] transition-all duration-500 group-hover:scale-[1.15]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
