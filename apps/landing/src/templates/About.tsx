import React from "react";

import { styled } from "../../tokens/stitches.config";
import { VStack } from "../elements/LayoutPrimitives";
import { ComparisonSection } from "./ComparisonSection";
import { CTASection } from "./CTASection";
import { FAQSection } from "./FAQSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";

type LandingPageProps = {
  lang?: "en" | "zh";
};

const LandingPageWrapper = styled("div", {
  background: "#1A1A1A", // Dark background
  color: "#EDEDED", // Light text
  width: "100%",
  minHeight: "100vh",
});

// TODO implement scroll snap
const LandingContainer = styled(VStack, {
  width: "100%",
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "0 24px",
  // scrollSnapType: 'y mandatory',
  // scrollBehavior: 'smooth',
  // '& > *': {
  //   scrollSnapAlign: 'start',
  //   scrollSnapStop: 'always',
  // },
  "@md": {
    padding: "0 48px",
  },
  "@lg": {
    padding: "0 80px",
  },
});

export function About({ lang = "en" }: LandingPageProps): JSX.Element {
  return (
    <LandingPageWrapper>
      <LandingHeader lang={lang} />

      <LandingContainer>
        <HeroSection lang={lang} />
        <ProblemSection lang={lang} />
        <SolutionSection lang={lang} />
        {/* <SocialProofSection lang={lang} /> */}
        {/* <FeatureSection lang={lang} /> */}
        <ComparisonSection lang={lang} />
        <FAQSection lang={lang} />
        <CTASection lang={lang} />
      </LandingContainer>

      <LandingFooter lang={lang} />
    </LandingPageWrapper>
  );
}
