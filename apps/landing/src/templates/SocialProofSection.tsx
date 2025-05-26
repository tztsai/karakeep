import React from "react";

import { styled } from "../../tokens/stitches.config";
import { Box, HStack, VStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "60px 0",
  margin: "20px 0 60px 0",
  background: "#1A1A1A",
  borderRadius: "16px",
});

const TestimonialGrid = styled(Box, {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "24px",
  maxWidth: "1100px",
  margin: "0 auto 40px auto",
  padding: "0 20px",

  "@md": {
    gridTemplateColumns: "1fr 1fr",
  },

  "@lg": {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
});

const Testimonial = styled(Box, {
  padding: "24px",
  background: "#252525",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  height: "100%",
  display: "flex",
  flexDirection: "column",

  "& blockquote": {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#EDEDED",
    margin: "0 0 16px 0",
    fontStyle: "italic",
    flex: 1,
  },

  "& .attribution": {
    fontSize: "0.875rem",
    color: "#F7C22D",
    fontWeight: 500,
  },
});

const MetricsContainer = styled(HStack, {
  maxWidth: "900px",
  margin: "0 auto",
  justifyContent: "center",
  gap: "40px",
  flexWrap: "wrap",
});

const Metric = styled(Box, {
  textAlign: "center",

  "& .number": {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#F7C22D",
    lineHeight: 1.2,
    margin: "0 0 8px 0",
  },

  "& .label": {
    fontSize: "1rem",
    color: "#ADADAD",
  },
});

export function SocialProofSection({
  lang,
}: {
  lang: "en" | "zh";
}): JSX.Element {
  const testimonials =
    lang === "zh"
      ? [
          {
            quote:
              "在Omnivore关闭后丢失了多年的保存文章，Ruminer的自动导出功能让我不再担心会再次丢失我的知识库。",
            attribution: "前Omnivore用户",
          },
          {
            quote:
              "AI搜索功能彻底改变了我与保存内容的交互方式。我发现了许多我手动永远不会发现的联系。",
            attribution: "知识工作者",
          },
          {
            quote:
              "从我喜欢的来源设置持续导入只花了几分钟，现在我的知识库会自动增长。",
            attribution: "研究人员",
          },
        ]
      : [
          {
            quote:
              "After losing years of saved articles when Omnivore shut down, Ruminer's automatic export feature gives me peace of mind that I'll never lose my knowledge base again.",
            attribution: "Former Omnivore User",
          },
          {
            quote:
              "The AI search capabilities have transformed how I interact with my saved content. I'm finding connections I never would have made manually.",
            attribution: "Knowledge Worker",
          },
          {
            quote:
              "Setting up continuous imports from my favorite sources took minutes, and now my knowledge base grows automatically.",
            attribution: "Researcher",
          },
        ];

  const metrics =
    lang === "zh"
      ? [
          { number: "500+", label: "已在我们的beta候补名单上的知识爱好者" },
          { number: "96%", label: "早期用户报告对数据主权更有信心" },
        ]
      : [
          {
            number: "500+",
            label: "knowledge enthusiasts already on our beta waitlist",
          },
          {
            number: "96%",
            label:
              "of early users report feeling more confident about their data sovereignty",
          },
        ];

  return (
    <SectionWrapper>
      <TestimonialGrid>
        {testimonials.map((testimonial, index) => (
          <Testimonial key={index}>
            <blockquote>&quot;{testimonial.quote}&quot;</blockquote>
            <div className="attribution">- {testimonial.attribution}</div>
          </Testimonial>
        ))}
      </TestimonialGrid>

      <MetricsContainer>
        {metrics.map((metric, index) => (
          <Metric key={index}>
            <div className="number">{metric.number}</div>
            <div className="label">{metric.label}</div>
          </Metric>
        ))}
      </MetricsContainer>
    </SectionWrapper>
  );
}
