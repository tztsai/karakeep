import React from "react";
import Image from "next/image";

import { styled } from "../../tokens/stitches.config";
import { Box, HStack } from "../elements/LayoutPrimitives";
import { WaitlistForm } from "./CTASection";

const HeroWrapper = styled(Box, {
  width: "100%",
  minHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "80px 0",
  position: "relative",
  overflow: "hidden",
  textAlign: "center",
});

const HeroHeadline = styled("h1", {
  fontSize: "3.5rem",
  fontWeight: 800,
  lineHeight: 1.2,
  margin: "0 0 40px 0",
  color: "#FFFFFF",
  maxWidth: "900px",
  "& span": {
    color: "#F7C22D",
  },
  "@mdDown": {
    fontSize: "2.5rem",
  },
});

const HeroSubheadline = styled("p", {
  fontSize: "1.25rem",
  lineHeight: 1.6,
  margin: "0 0 45px 0",
  color: "#9A9A9A",
  maxWidth: "800px",
  "& strong": {
    color: "#F7C22D",
  },
  "& i": {
    color: "#DCDCDC",
    fontWeight: 500,
  },
});

const HeroBannerContainer = styled("div", {
  width: "100%",
  maxWidth: "900px",
  margin: "40px 0",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  // Ensures the container maintains aspect ratio
  "&::before": {
    content: '""',
    display: "block",
    paddingTop: "56.25%", // 16:9 aspect ratio (506.25/900 = 0.5625)
  },

  // This is a placeholder - would be replaced with actual animation
  // '&::after': {
  //     content: '"Data Flow Animation"',
  //     position: 'absolute',
  //     top: '50%',
  //     left: '50%',
  //     transform: 'translate(-50%, -50%)',
  //     color: 'rgba(247, 194, 45, 0.3)',
  //     fontSize: '1.5rem',
  //     fontWeight: 700,
  // }
});

const DIKWDescription = styled(Box, {
  maxWidth: "600px",
  margin: "0 auto 30px auto",
  padding: "10px 50px 10px 50px",
  background: "rgba(247, 194, 45, 0.05)",
  borderRadius: "12px",
  position: "relative",

  "&::before": {
    content: '""',
    position: "absolute",
    top: "18px",
    left: "60px",
    bottom: "20px",
    width: "2px",
    background: "rgba(247, 194, 45, 0.9)",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "16px",
    left: "57px",
    width: "0",
    height: "0",
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    borderTop: "8px solid rgba(247, 194, 45, 0.9)",
  },

  "& ul": {
    listStyle: "none",
    padding: "0 0 0 32px",
    margin: 0,
  },

  "& li": {
    padding: 0,
    color: "#EDEDED",
    fontSize: "1.125rem",
    textAlign: "left",
    display: "flex",

    "& strong": {
      color: "#F7C22D",
    },

    "& .dikw-label": {
      minWidth: "160px",
      color: "#F7C22D",
      fontWeight: 600,
    },

    "& .dikw-value": {
      color: "#EDEDED",
    },
  },
});

export function HeroSection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const dikwItems =
    lang === "zh"
      ? [
          ["<strong>D</strong>ata:", "由您拥有！"],
          ["<strong>I</strong>nformation:", "与您相关！"],
          ["<strong>K</strong>nowledge:", "为您打造！"],
          ["<strong>W</strong>isdom:", "由您体现！"],
        ]
      : [
          ["<strong>D</strong>ata :", "owned by you!"],
          ["<strong>I</strong>nformation :", "relevant to you!"],
          ["<strong>K</strong>nowledge :", "built for you!"],
          ["<strong>W</strong>isdom :", "manifested in you!"],
        ];

  return (
    <HeroWrapper>
      <HeroHeadline>
        {lang === "zh"
          ? "Ruminer: 您的数字消化系统"
          : "Ruminer: Your Digital Digestive System"}
      </HeroHeadline>

      <HeroSubheadline>
        {lang === "zh" ? (
          <>
            信息混乱和数据锁定让您感到困扰？Ruminer通过
            <strong>轻松采集想法</strong>、<strong>持续导入与导出</strong>
            到您控制的存储，以及<strong>AI驱动的内容重新发现</strong>
            ，彻底改变了知识管理方式。完全拥有您的数据，同时将信息转化为可操作的知识。
          </>
        ) : (
          <>
            Troubled by <i>scattered information</i> and <i>platform lock-in</i>
            ? Ruminer transforms how you manage knowledge with{" "}
            <strong>Effortless Idea Capture</strong>,{" "}
            <strong>Continuous Import & Export</strong> across platforms, and{" "}
            <strong>AI-powered Recollection and Curation</strong>. Own your data
            completely while digesting information into personal knowledge.
          </>
        )}
      </HeroSubheadline>

      <HStack
        css={{
          gap: "60px",
          flexDirection: "column",
          alignItems: "center",
          "@md": { flexDirection: "row" },
        }}
      >
        <DIKWDescription>
          <ul>
            {dikwItems.map((item, index) => (
              <li key={index}>
                <span
                  className="dikw-label"
                  dangerouslySetInnerHTML={{ __html: item[0] }}
                ></span>
                <span
                  className="dikw-value"
                  dangerouslySetInnerHTML={{ __html: item[1] }}
                ></span>
              </li>
            ))}
          </ul>
        </DIKWDescription>

        {/* <BetaButton
                    lang={lang}
                    css={{
                        fontSize: '1.125rem',
                        padding: '12px 32px',
                        // margin: 'auto auto',
                        borderRadius: '8px'
                    }}
                /> */}

        <WaitlistForm addForm={false} lang={lang} css={{ maxWidth: "260px" }} />
      </HStack>

      <HeroBannerContainer>
        <Image
          src="/static/images/landing-illustration.png"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 900px"
          style={{ objectFit: "cover" }}
          alt="Hero Animation"
        />
      </HeroBannerContainer>
    </HeroWrapper>
  );
}
