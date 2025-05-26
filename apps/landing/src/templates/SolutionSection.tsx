import React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

import { styled } from "../../tokens/stitches.config";
import { BotArmIcon } from "../elements/icons/BotArmIcon";
import { IntegrateIcon } from "../elements/icons/IntegrateIcon";
import { RumenIcon } from "../elements/icons/RumenIcon";
import { Box, VStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "80px 0",
  margin: "20px 0",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 0 24px 0",
  color: "#F7C22D",
  textAlign: "center",
  "@mdDown": {
    fontSize: "2rem",
  },
});

const SolutionCard = styled(Box, {
  maxWidth: "900px",
  margin: "50px auto 50px auto",
  padding: "20px",
  background: "rgba(247, 194, 45, 0.05)",
  borderRadius: "16px",
  border: "1px solid rgba(247, 194, 45, 0.2)",
});

const CoreIntro = styled("p", {
  fontSize: "1.25rem",
  lineHeight: 1.6,
  color: "#EDEDED",
  margin: "0 0",
  textAlign: "center",
});

const ComponentsGrid = styled(Box, {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginBottom: "40px",
  maxWidth: "1200px",
  margin: "16px auto",

  "@md": {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
});

const ComponentCard = styled(VStack, {
  padding: "32px 24px",
  background: "#212121",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  height: "100%",
  transition: "transform 0.3s ease, border-color 0.3s ease",
  position: "relative",
  zIndex: 1,

  "&:hover": {
    transform: "translateY(-8px)",
    borderColor: "rgba(247, 194, 45, 0.3)",
  },

  "& h3": {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#F7C22D",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  "& .subtitle": {
    fontSize: "0.875rem",
    color: "#ADADAD",
    marginBottom: "16px",
  },

  "& .description": {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#EDEDED",
    flex: 1,
    marginBottom: "16px",
  },

  "& .benefit": {
    fontSize: "0.875rem",
    lineHeight: 1.6,
    color: "#ADADAD",
    margin: "0 0 24px 0",
    fontStyle: "italic",
  },

  "& .icon-container": {
    width: "48px",
    height: "48px",
    background: "rgba(247, 194, 45, 0.1)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },

  "& svg": {
    width: "30px",
    height: "30px",
    color: "#F7C22D",
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
    marginBottom: "24px",
  },
});

// CSS-based Dropdown Styles
const DropdownContainer = styled("div", {
  position: "relative",
  width: "240px",
  margin: "24px auto 0 auto",

  "&:hover .dropdown-content": {
    visibility: "visible",
    opacity: 1,
    transform: "translateY(0)",
    pointerEvents: "auto",
    transitionDelay: "0.1s",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    height: "15px",
    left: 0,
    right: 0,
    bottom: "-15px",
  },
});

const DropdownTrigger = styled("button", {
  background: "#F7C22D",
  color: "#1A1A1A",
  fontWeight: 600,
  borderRadius: "8px",
  padding: "10px 40px",
  fontSize: "0.9rem",
  border: "none",
  cursor: "pointer",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",

  "&:hover": {
    background: "#E0B129",
  },

  "&:hover svg": {
    transform: "rotate(90deg)",
  },

  "&:focus": {
    outline: "none",
  },

  "& svg": {
    transition: "transform 0.2s ease",
  },
});

const DropdownContent = styled("div", {
  visibility: "hidden",
  position: "absolute",
  left: 0,
  right: 0,
  top: "calc(100% + 6px)",
  zIndex: 150,
  minWidth: "240px",
  backgroundColor: "#2A2A2A",
  borderRadius: "12px",
  padding: "10px",
  boxShadow:
    "0px 10px 38px -10px rgba(22, 23, 24, 0.5), 0px 10px 20px -15px rgba(22, 23, 24, 0.3)",
  border: "1px solid rgba(247, 194, 45, 0.3)",
  opacity: 0,
  transform: "translateY(-8px)",
  transition:
    "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  pointerEvents: "none",
});

const DropdownItem = styled("a", {
  fontSize: "14px",
  padding: "12px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  color: "#EDEDED",
  display: "block",
  transition: "all 0.2s ease",
  margin: "2px 0",
  textDecoration: "none",

  "&:hover": {
    backgroundColor: "rgba(247, 194, 45, 0.15)",
    color: "#F7C22D",
  },
});

const DropdownSeparator = styled("div", {
  height: "1px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  margin: "4px 0",
});

const CaretIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      marginRight: "8px",
    }}
  >
    <path
      d="M5 3L9 7L5 11"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Types and interfaces
interface DropdownItem {
  label: string;
  link: string;
}

interface ComponentData {
  title: string;
  subtitle: string;
  description: string | React.ReactNode;
  benefit?: string;
  icon: React.ReactNode;
  visual?: string;
  buttonText: string;
  dropdownItems: DropdownItem[];
}

interface HoverDropdownProps {
  buttonText: string;
  items: DropdownItem[];
}

// React-state based hover dropdown component
const HoverDropdown: React.FC<HoverDropdownProps> = ({ buttonText, items }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Position state for the dropdown
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

  // Update position when container reference changes or window resizes
  React.useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 6, // 6px gap
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [containerRef.current]);

  // Handle mouseEnter and mouseLeave
  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, containerRef]);

  return (
    <DropdownContainer
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hover-maintained"
    >
      <DropdownTrigger>
        <CaretIcon /> {buttonText}
      </DropdownTrigger>
      {createPortal(
        <DropdownContent
          ref={dropdownRef}
          style={{
            visibility: isOpen ? "visible" : "hidden",
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-8px)",
            pointerEvents: isOpen ? "auto" : "none",
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
        >
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <DropdownSeparator />}
              <DropdownItem href={item.link}>{item.label}</DropdownItem>
            </React.Fragment>
          ))}
        </DropdownContent>,
        document.body,
      )}
    </DropdownContainer>
  );
};

export function SolutionSection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const components: ComponentData[] =
    lang === "zh"
      ? [
          // First row - corresponds to original solution components
          {
            title: "爪牙 - 捕获工具",
            subtitle: "移动应用 & 浏览器扩展",
            description:
              "快速记笔记，识别截图内容，剪辑网页和高亮内容，分享URL，上传PDF和EPUB文件等。Ruminer可成为您的中央收件箱。",
            icon: <BotArmIcon />,
            // visual: '多平台流向Ruminer应用图标',
            buttonText: "让我们收集！",
            dropdownItems: [
              { label: "iOS应用", link: "#ios-app" },
              { label: "Android应用", link: "#android-app" },
              { label: "Chrome扩展", link: "#chrome-extension" },
              { label: "Firefox扩展", link: "#firefox-extension" },
            ],
          },
          {
            title: "智囊 - 中央控制台",
            subtitle: "网页 & 桌面应用",
            description: (
              <>
                您的一站式信息处理平台。您的AI私人秘书{" "}
                <Link
                  href="https://www.weforum.org/stories/2021/08/second-brain-in-gut/"
                  style={{ color: "#F7C22D" }}
                >
                  ENS
                </Link>{" "}
                将基于深度个性化的理解，整理、搜索、回溯、汇报您的内容。
              </>
            ),
            icon: <RumenIcon />,
            // visual: '自动云备份与本地存储图标的分屏显示',
            buttonText: "让我们深思！",
            dropdownItems: [
              { label: "网页应用", link: "#web-app" },
              { label: "桌面应用（即将推出）", link: "#desktop-app" },
            ],
          },
          {
            title: "渠道 - 同步链路",
            subtitle: "API 连接器",
            description:
              "从其他平台无缝导入，并以可读格式持续导出到您的本地或云端私人存储。将数据孤岛连接为统一的知识生态系统。",
            icon: <IntegrateIcon />,
            // visual: '不同平台之间的数据流通示意图',
            buttonText: "让我们连通！",
            dropdownItems: [
              { label: "Readwise", link: "#readwise" },
              { label: "Raindrop", link: "#raindrop" },
              { label: "Pocket", link: "#pocket" },
              { label: "OneDrive", link: "#onedrive" },
              { label: "Dropbox", link: "#dropbox" },
            ],
          },
          // Second row - Ens AI assistant with three capabilities
          {
            title: "反刍 - AI搜索与回顾",
            subtitle: "智能检索与合成",
            description:
              "不仅仅是通过关键词搜索；与您的知识对话。提出复杂问题，我们的AI（Ens）将从您保存的内容中检索并合成最相关的信息，提供丰富上下文的答案。",
            // benefit: '将您的信息集合转变为动态的、可查询的知识资产。',
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 7V12L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            visual: "AI突出显示文档之间连接的对话界面",
            buttonText: "探索AI搜索",
            dropdownItems: [
              { label: "语义搜索", link: "#semantic-search" },
              { label: "知识图表", link: "#knowledge-graph" },
              { label: "间隔重复", link: "#spaced-repetition" },
            ],
          },
          {
            title: "消化 - 自动组织",
            subtitle: "智能分类与总结",
            description:
              "自动标记、语义链接和智能摘要帮助您理解您的集合。间隔重复提醒确保您重新访问关键见解。",
            // benefit: '花更少的时间组织，更多的时间理解和创造。',
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3H7C4.79086 3 3 4.79086 3 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 9L17 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 13L13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 17L10 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            visual: "自动组织知识图谱，突出显示连接",
            buttonText: "了解自动组织",
            dropdownItems: [
              { label: "自动标记", link: "#auto-tagging" },
              { label: "语义链接", link: "#semantic-linking" },
              { label: "智能摘要", link: "#smart-summaries" },
            ],
          },
          {
            title: "创作 - 写作辅助",
            subtitle: "理解与创造支持",
            description:
              "发现点与点之间的新连接，让AI将它们组合在一起！AI驱动的阅读和写作辅助帮助您快速理解复杂内容，识别关键见解，并在创作过程中获得灵感和支持，将您的想法转化为清晰、有条理的文本。",
            benefit:
              "加速知识获取并促进创意表达，将您的思想无缝转化为有影响力的内容。",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11.5C12 13.7091 10.2091 15.5 8 15.5C5.79086 15.5 4 13.7091 4 11.5C4 9.29086 5.79086 7.5 8 7.5C10.2091 7.5 12 9.29086 12 11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M17.5 4L17.5 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 7L15 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            visual: "AI辅助阅读与写作界面示例",
            buttonText: "发现创作工具",
            dropdownItems: [
              { label: "深度阅读", link: "#deep-reading" },
              { label: "写作辅助", link: "#writing-assistant" },
              { label: "知识激发", link: "#knowledge-inspiration" },
            ],
          },
        ]
      : [
          // First row - corresponds to original solution components
          {
            title: "Claws - Capture Tools",
            subtitle: "Mobile App & Browser Extensions",
            description:
              "Take quick notes, scan screenshots, clip web pages & highlights, upload PDF & EPUB files, share URLs, and more. Ruminer can become your central inbox.",
            // benefit: 'Stop worrying about where to save things. If it\'s important, Ruminer can take it.',
            icon: <BotArmIcon />,
            // visual: 'Icons of multiple platforms flowing into the Ruminer app icon',
            buttonText: "Let's Collect!",
            dropdownItems: [
              { label: "iOS App", link: "#ios-app" },
              { label: "Android App", link: "#android-app" },
              { label: "Chrome Extension", link: "#chrome-extension" },
              { label: "Firefox Extension", link: "#firefox-extension" },
            ],
          },
          {
            title: "Rumen - Central Panel",
            subtitle: "Web & Desktop App",
            description: (
              <>
                Your all-in-one workspace for information processing, where our
                AI agent{" "}
                <Link
                  href="https://www.weforum.org/stories/2021/08/second-brain-in-gut/"
                  style={{ color: "#F7C22D" }}
                >
                  ENS
                </Link>{" "}
                will curate, search, and report your content with deep
                personalized understanding.
              </>
            ),
            // benefit: 'Peace of mind. Your knowledge base is always backed up, always accessible, always yours, even if Ruminer didn\'t exist tomorrow.',
            icon: <RumenIcon />,
            // visual: 'Split-screen showing automatic cloud backup alongside local storage icons',
            buttonText: "Let's Ruminate!",
            dropdownItems: [
              { label: "Web App", link: "#web-app" },
              { label: "Desktop App (Coming Soon)", link: "#desktop-app" },
            ],
          },
          {
            title: "Tubes - Syncing Channels",
            subtitle: "API Connectors",
            description:
              "Seamless import from other platforms and export to your private storage in a readable format. Connect data silos into a unified knowledge ecosystem.",
            // benefit: 'Eliminate data silos and create a unified knowledge ecosystem where information flows freely between all your digital resources.',
            icon: <IntegrateIcon />,
            // visual: 'Data flow diagram between different platforms',
            buttonText: "Let's Sync!",
            dropdownItems: [
              { label: "Readwise", link: "#readwise" },
              { label: "Raindrop", link: "#raindrop" },
              { label: "Pocket", link: "#pocket" },
              { label: "OneDrive", link: "#onedrive" },
              { label: "Dropbox", link: "#dropbox" },
            ],
          },
          // Second row - Ens AI assistant with three capabilities
          {
            title: "Rumination - AI Search & Review",
            subtitle: "Intelligent Retrieval & Synthesis",
            description:
              "Don't just search by keywords; converse with your knowledge. Ask complex questions, and our AI (Ens) will retrieve and synthesize most relevant information from your saved items, providing context-rich answers.",
            benefit:
              "Transform your collection of information into a dynamic, queryable knowledge asset.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 7V12L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            visual:
              "Conversational interface with AI highlighting connections between documents",
            buttonText: "Explore AI Search",
            dropdownItems: [
              { label: "Semantic Search", link: "#semantic-search" },
              { label: "Knowledge Graph", link: "#knowledge-graph" },
              { label: "Spaced Repetition", link: "#spaced-repetition" },
            ],
          },
          {
            title: "Digestion - Auto Organization",
            subtitle: "Smart Classification & Summarization",
            description:
              "Automatic tagging, semantic linking, and smart summaries help you make sense of your collection. Spaced repetition reminders ensure you revisit key insights.",
            benefit:
              "Spend less time organizing and more time understanding and creating.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3H7C4.79086 3 3 4.79086 3 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 9L17 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 13L13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 17L10 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            visual:
              "Auto-organizing knowledge graph with highlighted connections",
            buttonText: "Learn Auto-Organization",
            dropdownItems: [
              { label: "Auto-Tagging", link: "#auto-tagging" },
              { label: "Semantic Linking", link: "#semantic-linking" },
              { label: "Smart Summaries", link: "#smart-summaries" },
            ],
          },
          {
            title: "Composition - Writing Assistance",
            subtitle: "Understanding & Creation Support",
            description:
              "Find new connections between the dots and let AI compose them together! AI-powered reading and writing assistance helps you quickly understand complex content, identify key insights, and get inspiration and support in your creative process, turning your ideas into clear, structured text.",
            benefit:
              "Accelerate knowledge acquisition and facilitate creative expression, seamlessly transforming your thoughts into impactful content.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11.5C12 13.7091 10.2091 15.5 8 15.5C5.79086 15.5 4 13.7091 4 11.5C4 9.29086 5.79086 7.5 8 7.5C10.2091 7.5 12 9.29086 12 11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M17.5 4L17.5 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 7L15 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            visual: "AI-assisted reading and writing interface example",
            buttonText: "Discover Creation Tools",
            dropdownItems: [
              { label: "Deep Reading", link: "#deep-reading" },
              { label: "Writing Assistant", link: "#writing-assistant" },
              {
                label: "Knowledge Inspiration",
                link: "#knowledge-inspiration",
              },
            ],
          },
        ];

  return (
    <SectionWrapper id="solution">
      <SectionHeadline>
        {lang === "zh"
          ? "Ruminer：整合、消化和掌控您的数字世界"
          : "Ruminer: Integrate, Digest, and Own Your Digital World"}
      </SectionHeadline>

      <SolutionCard>
        <CoreIntro>
          {lang === "zh"
            ? 'Ruminer 的目标是成为您数字空间中的中央"消化系统"，专为重视知识并要求完全控制的用户而打造。我们提供工具持续收集您的信息，提供智能来理解和整理它，并让您自由地永久存储在您选择的任何地方。'
            : 'Ruminer aims to be the central "digestive system" in your digital space, built for those who value their knowledge and demand full control. We provide the tools to continuously gather your information, the intelligence to understand and curate it, and the freedom to store it wherever you choose – forever.'}
        </CoreIntro>
      </SolutionCard>

      {/* First row - Original solution components */}
      <ComponentsGrid id="features">
        {components.slice(0, 3).map((component, index) => (
          <ComponentCard key={index}>
            <div className="icon-container">{component.icon}</div>
            <h3>{component.title}</h3>
            <div className="subtitle">{component.subtitle}</div>
            <div className="description">{component.description}</div>
            {component.benefit && (
              <div className="benefit">
                <strong>{lang === "zh" ? "优势：" : "Benefit:"}</strong>{" "}
                {component.benefit}
              </div>
            )}
            {component.visual && (
              <div className="visual">{component.visual}</div>
            )}
            <HoverDropdown
              buttonText={component.buttonText}
              items={component.dropdownItems}
            />
          </ComponentCard>
        ))}
      </ComponentsGrid>

      {/* Second row - Ens AI capabilities */}
      {/* <ComponentsGrid>
        {components.slice(3, 6).map((component, index) => (
          <ComponentCard key={index + 3}>
            <div className="icon-container">
              {component.icon}
            </div>
            <h3>{component.title}</h3>
            <div className="subtitle">{component.subtitle}</div>
            <div className="description">{component.description}</div>
            {component.benefit && (
              <div className="benefit">
                <strong>{lang === 'zh' ? '优势：' : 'Benefit:'}</strong> {component.benefit}
              </div>
            )}
            {component.visual && (
              <div className="visual">{component.visual}</div>
            )}
            <HoverDropdown
              buttonText={component.buttonText}
              items={component.dropdownItems}
            />
          </ComponentCard>
        ))}
      </ComponentsGrid> */}
    </SectionWrapper>
  );
}
