"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = [
    {
        question: "What is Room about?",
        answer: "Room is a decentralized video meeting platform that lets people connect through real-time audio and video while sending tokens like gifts during calls — directly from wallet to wallet."
    },
    {
        question: "How do I secure my account?",
        answer: "Since Room is Starknet-native, your account is secured by your wallet. You don't need a password; your private keys stay with you."
    },
    {
        question: "Do I need coding experience?",
        answer: "Not at all. Room is designed to be as simple as any other video conferencing tool, but with the added power of blockchain features built right in."
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
