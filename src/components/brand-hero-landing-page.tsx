"use client";

import { Header, Footer } from "./brand-hero/Layout";
import { HeroSection } from "./brand-hero/HeroSection";
import { CoreMessageSection } from "./brand-hero/CoreMessageSection";
import { VisualProofSection } from "./brand-hero/VisualProofSection";
import { ValuePropsSection } from "./brand-hero/ValuePropsSection";
import { ComparisonSection } from "./brand-hero/ComparisonSection";
import { BrandDNASection } from "./brand-hero/BrandDNASection";
import { DayInTheLifeSection } from "./brand-hero/DayInTheLifeSection";
import { WaitlistProvider } from "./brand-hero/WaitlistContext";

export default function BrandHeroLandingPage() {
    return (
        <WaitlistProvider>
            <div className="min-h-screen bg-black text-foreground selection:bg-teal-500/30">
                <Header />
                <HeroSection />
                <CoreMessageSection />
                <VisualProofSection />
                <ValuePropsSection />
                <ComparisonSection />
                <BrandDNASection />
                <DayInTheLifeSection />
                <Footer />
            </div>
        </WaitlistProvider>
    );
}
