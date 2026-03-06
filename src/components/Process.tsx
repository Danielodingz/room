import Image from "next/image";

export default function Process() {
    const steps = [
        {
            title: "Connect Your Wallet",
            description: "Securely connect your wallet to access rooms, interact with others, and manage your tokens seamlessly.",
            image: "/assets/images/process_wallet.png",
            icon: null,
            btn: null
        },
        {
            title: "Create or Join a Room",
            description: "Start your own room or join an existing one to collaborate, host discussions, classes, or community events.",
            image: "/assets/images/process_room.png",
            icon: null,
            btn: null
        },
        {
            title: "Send Token Gifts",
            description: "Show appreciation by sending token gifts to participants, speakers, or community members during sessions.",
            image: "/assets/images/process_send_gifts.png",
            icon: null,
            btn: null
        }
    ];

    return (
        <section id="process" className="section-container pt-32 pb-20">
            <div className="text-center space-y-4 mb-20">
                <span className="text-[11.6px] font-bold tracking-widest text-[#FF6830] uppercase">PROCESS</span>
                <h2 className="heading-2">How it works?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white/40 rounded-[24px] p-10 border border-gray-100 shadow-[0px_50px_35px_-1.5px_rgba(0,0,0,0.08)] flex flex-col gap-8 group hover:bg-white/60 transition-all duration-500 min-h-[460px]">
                        <div className="relative aspect-square w-full max-w-[280px] mx-auto flex items-center justify-center">
                            {step.image ? (
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    fill
                                    className="object-contain p-2 scale-110 transition-transform duration-500 group-hover:scale-125"
                                />
                            ) : (
                                <div className="text-4xl">{step.icon}</div>
                            )}
                        </div>
                        <div className="space-y-4 text-center mt-auto">
                            <h3 className="text-[25.8px] font-bold text-[#121212] leading-tight tracking-tight">{step.title}</h3>
                            <p className="text-[#545454] font-normal leading-relaxed text-[14.6px]">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
