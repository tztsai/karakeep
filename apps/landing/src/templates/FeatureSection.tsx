import React from "react";

import { styled } from "../../tokens/stitches.config";
import { Box, HStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "80px 0",
  margin: "40px 0",
});

const SectionIntro = styled(HStack, {
  textAlign: "center",
  maxWidth: "800px",
  margin: "0 auto 60px auto",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 0 24px 0",
  color: "#F7C22D",
  "@mdDown": {
    fontSize: "2rem",
  },
});

const FeaturesGrid = styled(Box, {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "40px",
  maxWidth: "1200px",
  margin: "0 auto",

  "@md": {
    gridTemplateColumns: "1fr 1fr",
  },
});

const FeatureCard = styled(Box, {
  padding: "32px",
  background: "#212121",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  transition: "transform 0.3s ease, border-color 0.3s ease",

  "&:hover": {
    transform: "translateY(-8px)",
    borderColor: "rgba(247, 194, 45, 0.3)",
  },

  "& h3": {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#F7C22D",
    margin: "0 0 16px 0",
  },

  "& .description": {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#EDEDED",
    margin: "0 0 16px 0",
  },

  "& .benefit": {
    fontSize: "0.875rem",
    lineHeight: 1.6,
    color: "#ADADAD",
    margin: "0 0 24px 0",
    fontStyle: "italic",
  },

  "& .visual": {
    height: "140px",
    background: "rgba(247, 194, 45, 0.03)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(247, 194, 45, 0.2)",
    fontSize: "0.875rem",
  },
});

export function FeatureSection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const features =
    lang === "zh"
      ? [
          {
            title: "轻松捕获一切",
            description:
              "连接您喜爱的平台（YouTube、Twitter等），从Readwise导入，快速笔记，扫描截图，剪辑网页等。Ruminer成为您的中央收件箱。",
            benefit: "不必担心在哪里保存东西。如果很重要，Ruminer可以接收它。",
            visual: "多平台流向Ruminer应用图标",
          },
          {
            title: "您的数据，您的条件（持续同步和导出）",
            description:
              "设置频道以持续从您的来源导入，并且至关重要的是，以可读格式将您的所有数据导出到您偏好的私人存储（本地文件夹、GitHub、OneDrive等）。",
            benefit:
              "安心无忧。您的知识库始终备份，始终可访问，始终是您的，即使明天Ruminer不存在了。",
            visual: "自动云备份与本地存储图标的分屏显示",
          },
          {
            title: "使用AI搜索揭示深层见解",
            description:
              "不仅仅是通过关键词搜索；与您的知识对话。提出复杂问题，我们的AI（Anan）将从您保存的内容中检索并合成最相关的信息，提供丰富上下文的答案。",
            benefit: "将您的信息集合转变为动态的、可查询的知识资产。",
            visual: "AI突出显示文档之间连接的对话界面",
          },
          {
            title: "AI辅助组织和回顾",
            description:
              "自动标记、语义链接和智能摘要帮助您理解您的集合。间隔重复提醒确保您重新访问关键见解。",
            benefit: "花更少的时间组织，更多的时间理解和创造。",
            visual: "自动组织知识图谱，突出显示连接",
          },
        ]
      : [
          {
            title: "Capture Everything, Effortlessly",
            description:
              "Take quick notes, scan screenshots, clip web pages & highlights, share URLs, upload PDF & EPUB files, and more. Ruminer becomes your central inbox.",
            benefit:
              "Stop worrying about where to save things. If it's important, Ruminer can take it.",
            visual:
              "Icons of multiple platforms flowing into the Ruminer app icon",
          },
          {
            title: "Centralized & Localized Knowledge Base",
            description:
              "Set up channels to continuously import from your sources and, crucially, to export all your data in readable format to your preferred private storage (local folder, GitHub, OneDrive, etc.).",
            benefit:
              "Peace of mind. Your knowledge base is always backed up, always accessible, always yours, even if Ruminer didn't exist tomorrow.",
            visual:
              "Split-screen showing automatic cloud backup alongside local storage icons",
          },
          {
            title: "Uncover Deep Insights with AI Search",
            description:
              "Don't just search by keywords; converse with your knowledge. Ask complex questions, and our AI (Anan) will retrieve and synthesize most relevant information from your saved items, providing context-rich answers.",
            benefit:
              "Transform your collection of information into a dynamic, queryable knowledge asset.",
            visual:
              "Conversational interface with AI highlighting connections between documents",
          },
          {
            title: "AI-Assisted Organization & Review",
            description:
              "Automatic tagging, semantic linking, and smart summaries help you make sense of your collection. Spaced repetition reminders ensure you revisit key insights.",
            benefit:
              "Spend less time organizing and more time understanding and creating.",
            visual:
              "Auto-organizing knowledge graph with highlighted connections",
          },
        ];

  return (
    <SectionWrapper id="features">
      <SectionIntro>
        <SectionHeadline>
          {lang === "zh" ? "如何运作" : "How It Works"}
        </SectionHeadline>
      </SectionIntro>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <h3>{feature.title}</h3>
            <div className="description">{feature.description}</div>
            <div className="benefit">
              <strong>{lang === "zh" ? "优势：" : "Benefit:"}</strong>{" "}
              {feature.benefit}
            </div>
            <div className="visual">{feature.visual}</div>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </SectionWrapper>
  );
}
