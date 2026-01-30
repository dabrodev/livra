"use client";

import CookieConsent from "react-cookie-consent";
import Link from "next/link";

export default function CookieBanner() {
    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept All"
            declineButtonText="Essential Only"
            enableDeclineButton
            cookieName="livra-cookie-consent"
            style={{
                background: "rgba(9, 9, 11, 0.95)", // bg-zinc-950 with opacity
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                padding: "10px 20px",
                alignItems: "center",
                fontSize: "13px",
                color: "#d4d4d8", // text-zinc-300
                zIndex: 99999, // Ensure it's on top of everything
            }}
            buttonStyle={{
                background: "#14b8a6", // teal-500
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                borderRadius: "9999px",
                padding: "8px 24px",
                margin: "0 0 0 10px",
            }}
            declineButtonStyle={{
                background: "transparent",
                color: "#a1a1aa", // text-zinc-400
                fontSize: "12px",
                padding: "8px 16px",
                margin: "0 10px 0 0",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px",
            }}
            expires={365} // 1 year
        >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <span>
                    We use cookies to enhance your experience and analyze our traffic. By continuing, you agree to our use of cookies.
                </span>
                <Link href="/privacy-policy" className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors">
                    Privacy Policy
                </Link>
            </div>
        </CookieConsent>
    );
}
