"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroV4 from "@/components/inmobiliarias/HeroV4";
import ProblemSectionV4 from "@/components/inmobiliarias/ProblemSectionV4";
import HowItWorksV4 from "@/components/inmobiliarias/HowItWorksV4";
import FunnelComparison from "@/components/inmobiliarias/FunnelComparison";
import GuaranteeV3 from "@/components/inmobiliarias/GuaranteeV3";
import AgencyValueV4 from "@/components/inmobiliarias/AgencyValueV4";
import ControlV4 from "@/components/inmobiliarias/ControlV4";
import MetricsV3 from "@/components/inmobiliarias/MetricsV3";
import IntegrationV4 from "@/components/inmobiliarias/IntegrationV4";
import CTAV3 from "@/components/inmobiliarias/CTAV3";
import AboutV3 from "@/components/inmobiliarias/AboutV3";
import FAQV3 from "@/components/inmobiliarias/FAQV3";

const LandingInmobiliarias = () => {

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header hideSearch landingCta="Sumá tu inmobiliaria" />

      <HeroV4 />

      <ProblemSectionV4 />

      <div id="how-it-works">
        <HowItWorksV4 />
      </div>

      <FunnelComparison />

      <GuaranteeV3 />

      <AgencyValueV4 />

      <ControlV4 />

      <MetricsV3 />

      <IntegrationV4 />

      <CTAV3 />

      <AboutV3 />

      <FAQV3 />

      <Footer />
    </div>
  );
};

export default LandingInmobiliarias;
