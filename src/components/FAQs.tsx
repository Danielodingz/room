"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = [
    {
        question: "What is a Room?",
        answer: "A Room is a shared space where people can meet, collaborate, host discussions, run classes, or organize hackathons in real time."
    },
    {
        question: "Do I need a wallet to use Rooms?",
        answer: "Yes. Connecting your wallet allows you to access rooms, interact with participants, and send token gifts securely."
    },
    {
        question: "How do I join a Room?",
        answer: "You can join a room through an invite link or by selecting an available room on the platform."
    }
];

export default function FAQs() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faqs" className="section-container pt-32 pb-32">
            <div className="mb-20">
                <span className="text-[11.6px] font-bold tracking-widest text-[#FF6830] uppercase block text-center mb-4">FAQS</span>
                <h2 className="heading-2">Frequently Asked Questions</h2>
            </div>

            <div className="max-w-[775px] mx-auto space-y-4">
                {faqData.map((item, index) => (
                    <div key={index} className="group">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className={`w-full text-left px-8 py-6 rounded-[24px] border transition-all duration-500 flex items-center justify-between ${openIndex === index
                                ? "bg-white border-transparent shadow-[0px_50px_35px_-1.5px_rgba(0,0,0,0.08)]"
                                : "bg-white/40 border-gray-100 hover:bg-white/60"
                                }`}
                        >
                            <span className="text-[25.4px] font-bold text-[#121212] tracking-tight">{item.question}</span>
                            <ChevronDown
                                size={20}
                                className={`text-[#121212] transition-transform duration-500 ${openIndex === index ? "rotate-180" : ""}`}
                            />
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="px-8 py-6 text-[#545454] text-[15.1px] font-normal leading-[24px]">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
