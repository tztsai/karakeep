import React, { useState } from "react";

import { styled } from "../../tokens/stitches.config";
import { Box, VStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "40px 0",
  margin: "40px 0 0 0",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 0 48px 0",
  color: "#F7C22D",
  textAlign: "center",
  "@mdDown": {
    fontSize: "2rem",
  },
});

const FAQContainer = styled(VStack, {
  maxWidth: "900px",
  margin: "0 auto",
  gap: "16px",
});

const FAQItem = styled(Box, {
  width: "100%",
  background: "#212121",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.05)",
});

const FAQQuestion = styled("button", {
  width: "100%",
  background: "transparent",
  border: "none",
  padding: "20px 24px",
  textAlign: "left",
  color: "#EDEDED",
  fontSize: "1.125rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "color 0.2s ease",

  "&:hover": {
    color: "#F7C22D",
  },

  "&:focus": {
    outline: "none",
  },

  "& .icon": {
    fontSize: "1.25rem",
    transition: "transform 0.3s ease",
  },

  variants: {
    open: {
      true: {
        color: "#F7C22D",

        "& .icon": {
          transform: "rotate(180deg)",
        },
      },
    },
  },
});

const FAQAnswer = styled("div", {
  padding: "0 24px",
  height: "0",
  overflow: "hidden",
  transition: "height 0.3s ease, padding 0.3s ease",

  variants: {
    open: {
      true: {
        height: "auto",
        padding: "0 24px 24px 24px",
      },
    },
  },

  "& p": {
    color: "#ADADAD",
    fontSize: "1rem",
    lineHeight: 1.6,
    margin: 0,
  },
});

interface FAQItemProps {
  question: string;
  answer: string | JSX.Element;
}

function FAQItemComponent({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FAQItem>
      <FAQQuestion open={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {question}
        <span className="icon">{isOpen ? "−" : "+"}</span>
      </FAQQuestion>
      <FAQAnswer open={isOpen}>
        <p>{answer}</p>
      </FAQAnswer>
    </FAQItem>
  );
}

export function FAQSection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const faqItems =
    lang === "zh"
      ? [
          {
            question: "Ruminer与Readwise、Pocket或其他稍后阅读应用有什么不同？",
            answer:
              "虽然这些工具擅长保存内容，但Ruminer专注于完整的知识生命周期 - 捕获、处理、连接和回顾您的内容，具有持续导出功能和先进的AI功能。",
          },
          {
            question: "Ruminer能否与我现有的工具一起使用？",
            answer:
              "是的！Ruminer旨在与您当前的信息处理流程无缝集成。我们支持从Readwise、Pocket导入，用于捕获网络内容的浏览器扩展，以及与YouTube、Twitter等网络平台的连接。",
          },
          {
            question: "我在Ruminer上的数据安全性如何？",
            answer:
              "我们优先考虑您的数据主权和隐私权。所有内容都会自动导出到您控制的存储(本地/云端硬盘、GitHub仓库等)，确保您任何时候，无论线上还是线下，都不会失去您的数据访问权。",
          },
          {
            question: "如果Ruminer关闭，我的数据会怎样？",
            answer:
              "与其他服务不同，Ruminer的持续导出功能意味着您的完整知识库已经存在于您控制的存储空间中。您永远不会像前Omnivore用户那样经历数据丢失。",
          },
          {
            question: "AI功能是否使用我的数据来训练大型语言模型？",
            answer:
              "绝对不会。您的数据是私有的，仅用于为您服务。我们不会在您的内容上训练模型，也不会与第三方共享。",
          },
        ]
      : [
          {
            question:
              "How is Ruminer different from Readwise, Pocket, or other read-later apps?",
            answer:
              "While these tools excel at saving content, Ruminer focuses on the complete knowledge lifecycle - capturing, connecting, processing, and reviewing your content with continuous export capability and advanced AI features.",
          },
          {
            question: "Will Ruminer work with my existing tools?",
            answer:
              "Yes! Ruminer is designed to seamlessly integrate with your current workflow. We support imports from read-later apps like Readwise and Pocket, browser extensions for capturing web content, and connections to popular web platforms like YouTube and Twitter.",
          },
          {
            question: "How secure is my data with Ruminer?",
            answer:
              "We prioritize your data sovereignty and privacy. All your content is automatically exported to storage you control (local/cloud drive, GitHub repository, etc.), ensuring you never lose access at any time, online or offline.",
          },
          {
            question: "What happens to my data if Ruminer shuts down?",
            answer:
              "Unlike other services, Ruminer's continuous export feature means your complete knowledge base already exists in storage you control. You'll never experience data loss like former Omnivore users did.",
          },
          {
            question:
              "Is the AI feature using my data to train large language models?",
            answer: (
              <>
                Absolutely not. Your data is private and only used to serve{" "}
                <strong>you</strong>. We don&apos;t train models on your content
                or share it with third parties.
              </>
            ),
          },
        ];

  return (
    <SectionWrapper id="faq">
      <SectionHeadline>
        {lang === "zh" ? "常见问题" : "Frequently Asked Questions"}
      </SectionHeadline>

      <FAQContainer>
        {faqItems.map((item, index) => (
          <FAQItemComponent
            key={index}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </FAQContainer>
    </SectionWrapper>
  );
}
