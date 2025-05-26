import React from "react";

import { styled } from "../../tokens/stitches.config";
import { Box } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  padding: "60px 0 20px 0",
  margin: "40px 0",
  background: "#212121",
  borderRadius: "16px",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  margin: "0 0 40px 0",
  color: "#F7C22D",
  textAlign: "center",
  "@mdDown": {
    fontSize: "2rem",
  },
});

const TableContainer = styled(Box, {
  maxWidth: "900px",
  margin: "0 auto 32px auto",
  overflowX: "auto",
});

const ComparisonTable = styled("table", {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,

  "& th, & td": {
    padding: "16px 24px",
    textAlign: "center",
    fontSize: "0.9375rem",
  },

  "& th": {
    color: "#F7C22D",
    fontWeight: 600,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",

    "&:first-child": {
      textAlign: "left",
    },
  },

  "& tr td": {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#ADADAD",

    "&:first-child": {
      color: "#EDEDED",
      textAlign: "left",
      fontWeight: 500,
    },
  },

  "& tr:last-child td": {
    borderBottom: "none",
  },
});

const CheckMark = styled(Box, {
  color: "#F7C22D",
  fontSize: "1.25rem",
  fontWeight: "bold",
});

const XMark = styled(Box, {
  color: "#777777",
  fontSize: "1.25rem",
  fontWeight: "bold",
});

const Limited = styled(Box, {
  color: "#ADADAD",
  fontSize: "0.875rem",
});

const ComparisonQuote = styled("p", {
  textAlign: "center",
  color: "#EDEDED",
  fontSize: "1.125rem",
  fontWeight: 500,
  maxWidth: "700px",
  margin: "0 auto",

  "& em": {
    fontStyle: "normal",
    color: "#F7C22D",
  },
});

export function ComparisonSection({
  lang,
}: {
  lang: "en" | "zh";
}): JSX.Element {
  // Features to compare
  const features =
    lang === "zh"
      ? [
          "完全数据所有权",
          "自动导出",
          "智能查找和引用",
          "多源同步导入",
          "自动添加标签和链接",
          "定时总结汇报",
          "智能写作助手",
        ]
      : [
          "Full Data Ownership",
          "Automatic Exports",
          "AI Search & Reference",
          "Multi-Source Syncing",
          "Auto Tagging & Linking",
          "Regular Summary Reports",
          "AI Writing Assistance",
        ];

  const competitors =
    lang === "zh"
      ? ["传统PKM工具", "笔记应用"]
      : ["Traditional PKM Tools", "Note-Taking Apps"];

  const tagline =
    lang === "zh"
      ? "不要接受那些控制您知识的平台。使用Ruminer，您拥有完全控制权。"
      : "Don't settle for platforms that hold your knowledge hostage. With Ruminer, you're in control.";

  return (
    <SectionWrapper id="why-ruminer">
      <SectionHeadline>
        {lang === "zh" ? "为什么选择 Ruminer？" : "Why Ruminer?"}
      </SectionHeadline>

      <TableContainer>
        <ComparisonTable>
          <thead>
            <tr>
              <th>{lang === "zh" ? "功能" : "Feature"}</th>
              <th>Ruminer</th>
              {competitors.map((competitor, index) => (
                <th key={index}>{competitor}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index}>
                <td>
                  <strong>{feature}</strong>
                </td>
                <td>
                  <CheckMark>✓</CheckMark>
                </td>
                {[0, 2, 3, 4].includes(index) ? (
                  <td>
                    <Limited>{lang === "zh" ? "有限" : "Limited"}</Limited>
                  </td>
                ) : (
                  <td>
                    <XMark>✗</XMark>
                  </td>
                )}
                {[0].includes(index) ? (
                  <td>
                    <Limited>{lang === "zh" ? "有限" : "Limited"}</Limited>
                  </td>
                ) : (
                  <td>
                    <XMark>✗</XMark>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </ComparisonTable>
      </TableContainer>

      {/* <ComparisonQuote>
        <em>"{tagline}"</em>
      </ComparisonQuote> */}
    </SectionWrapper>
  );
}
