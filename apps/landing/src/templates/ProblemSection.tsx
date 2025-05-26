import React from "react";

import { styled } from "../../tokens/stitches.config";
import { Box, VStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "80px 0",
  background: "#212121",
  borderRadius: "16px",
  margin: "0 0",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.5rem",
  maxWidth: "1000px",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 auto 48px auto",
  color: "#EDEDED",
  textAlign: "center",
  "@mdDown": {
    fontSize: "2rem",
  },
});

const PainPointsContainer = styled(VStack, {
  maxWidth: "900px",
  margin: "0 auto",
  gap: "28px",
});

const PainPoint = styled(Box, {
  width: "100%",
  padding: "24px",
  background: "rgba(26, 26, 26, 0.6)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",

  "& h3": {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#F7C22D",
    margin: "0 0 12px 0",
  },

  "& p": {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#ADADAD",
    margin: 0,
  },
});

export function ProblemSection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const painPoints =
    lang === "zh"
      ? [
          {
            title: "分散的知识和洞见的遗失",
            description:
              "您喜爱的内容和宝贵的见解分散在无数应用程序和服务中，使它们难以找到和使用。Ruminer 允许您创建与其他平台的同步渠道，集中管理您订阅和保存的内容。",
          },
          {
            title: "难以找到您保存的内容",
            description:
              "基本的关键词搜索仅仅触及了您庞大收藏的表面。您可能只有模糊的想法而非确切的匹配项。Ruminer 的 AI 驱动研究机制使您能够深入探索您的个人收藏，发掘珍贵知识。",
          },
          {
            title: "云平台上不永久且被锁定的数据",
            description:
              "您是否因服务关闭或付费墙阻挡而意外失去对珍贵收藏的访问权？由于 Ruminer 能够以开放格式持续将您的所有数据导出到您的私人存储中，这将不再是一个顾虑。",
          },
        ]
      : [
          {
            title: "Scattered Knowledge & Lost Insights",
            description:
              "Your favorite content and valuable insights are spread across countless apps and services, making them hard to find and use. Ruminer allows you to create syncing channels with other platforms to centrally manage your subscribed and saved content.",
          },
          {
            title: "Difficulty to Find Your Saved Content",
            description:
              "Basic keyword search barely scratches the surface of your vast collections. You may only have a vague idea of what you want to find instead of exact matches. Ruminer's AI-powered research mechanism enables you to explore deeply into your personal collections and dig out antique knowledge.",
          },
          {
            title: "Impermanent & Locked-in Data on Cloud Platforms",
            description:
              "Have you experienced the pain of losing access to your precious collections unexpectedly due to a service shutdown or paywall blockage? As Ruminer can continuously export all your data in open format to your private storage, that's a worry of the past.",
          },
        ];

  return (
    <SectionWrapper id="problems">
      <SectionHeadline>
        {lang === "zh"
          ? "您是否经历过以下问题？"
          : "Ever Suffered from the Following Problems?"}
      </SectionHeadline>

      <PainPointsContainer>
        {painPoints.map((point, index) => (
          <PainPoint key={index}>
            <h3>{point.title}</h3>
            <p>{point.description}</p>
          </PainPoint>
        ))}
      </PainPointsContainer>
    </SectionWrapper>
  );
}
