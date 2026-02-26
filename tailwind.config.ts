import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    peach: "#ff9d80",
                    purple: "#c084fc",
                    orange: "#fb923c",
                    green: "#22c55e",
                },
            },
            borderRadius: {
                "2xl": "1.5rem",
                "3xl": "2.5rem",
                "4xl": "4rem",
            },
            boxShadow: {
                "soft": "0 2px 10px rgba(0,0,0,0.05)",
                "soft-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
                "soft-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
