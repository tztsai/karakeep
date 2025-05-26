import React, { useState } from "react";
import Link from "next/link";

import { fetchEndpoint } from "../../lib/appConfig";
import { styled } from "../../tokens/stitches.config";
import { Button } from "../elements/Button";
import { BorderedFormInput, FormLabel } from "../elements/FormElements";
import { Box, HStack, VStack } from "../elements/LayoutPrimitives";

const SectionWrapper = styled(Box, {
  width: "100%",
  maxWidth: "1000px",
  padding: "160px 0",
  margin: "20px auto",
  background:
    "radial-gradient(ellipse closest-corner at center, rgba(247, 194, 45, 0.25) 0%, rgba(26, 26, 26, 0) 70%)",
  textAlign: "center",
});

const SectionHeadline = styled("h2", {
  fontSize: "2.75rem",
  fontWeight: 800,
  lineHeight: 1.2,
  margin: "0 0 24px 0",
  color: "#F7C22D",
  "@mdDown": {
    fontSize: "2.25rem",
  },
});

const SectionText = styled("p", {
  fontSize: "1.125rem",
  lineHeight: 1.6,
  color: "#EDEDED",
  maxWidth: "800px",
  margin: "0 auto 20px auto",
});

const BetaDetail = styled("li", {
  color: "#ADADAD",
  fontSize: "1rem",
  margin: "8px 0",
});

const BetaDetails = styled("ul", {
  listStyle: "none",
  padding: 0,
  maxWidth: "600px",
  margin: "0 auto 40px auto",
});

const UrgencyBadge = styled(Box, {
  display: "inline-block",
  padding: "8px 16px",
  background: "rgba(247, 194, 45, 0.1)",
  borderRadius: "100px",
  color: "#F7C22D",
  fontSize: "0.875rem",
  fontWeight: 600,
  margin: "0 60px 40px 0",
});

const SecondaryLinks = styled(HStack, {
  gap: "24px",
  margin: "24px 0 0 0",
  justifyContent: "center",
  flexWrap: "wrap",
});

const SecondaryLink = styled(Link, {
  color: "#ADADAD",
  textDecoration: "none",
  fontSize: "0.9375rem",
  transition: "color 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",

  "&:hover": {
    color: "#F7C22D",
  },

  "& svg": {
    width: "16px",
    height: "16px",
  },
});

export function CTASection({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const betaDetails =
    lang === "zh"
      ? [
          "所有高级功能的早期访问",
          "对产品路线图的影响",
          "我们推出时的终身折扣",
          "创始团队的优先支持",
        ]
      : [
          "Early access to all premium features",
          "Influence on product roadmap",
          "Lifetime discount when we launch",
          "Priority support from our founding team",
        ];

  return (
    <SectionWrapper id="beta">
      <SectionHeadline>
        {lang === "zh"
          ? "准备好开始数字反刍了吗？"
          : "Ready to Start Digital Rumination?"}
      </SectionHeadline>

      {/* <SectionText>
        {lang === 'zh'
          ? '我们的有限beta计划现已开放。成为最早体验Ruminer并帮助塑造其未来的用户之一。Beta用户将获得：'
          : 'Our limited beta program is now open. Be among the first to experience Ruminer and help shape its future. Beta users will receive:'}
      </SectionText>

      <BetaDetails>
        {betaDetails.map((detail, index) => (
          <BetaDetail key={index}>{detail}</BetaDetail>
        ))}
      </BetaDetails>

      <UrgencyBadge>
        {lang === 'zh'
          ? `Beta名额限制为1000个用户 - 还剩${process.env.NEXT_PUBLIC_BETA_SPOTS_REMAINING}个名额`
          : `Beta spots limited to 1000 users - ${process.env.NEXT_PUBLIC_BETA_SPOTS_REMAINING} spots remaining`}
      </UrgencyBadge> */}

      <WaitlistForm addForm={true} lang={lang} />

      {/* <SecondaryLinks>
        <SecondaryLink href="#demo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 8L16 12L10 16V8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {lang === 'zh' ? '观看演示' : 'Watch the Demo'}
        </SecondaryLink>
        <SecondaryLink href="#whitepaper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 13H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {lang === 'zh' ? '阅读我们的白皮书' : 'Read Our Whitepaper'}
        </SecondaryLink>
      </SecondaryLinks> */}
    </SectionWrapper>
  );
}

const FormWrapper = styled("form", {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto 40px auto",
  alignItems: "center",
});

const FormRow = styled(VStack, {
  gap: "8px",
  alignItems: "flex-start",
  width: "100%",
});

const TextArea = styled("textarea", {
  width: "100%",
  minHeight: "100px",
  padding: "12px",
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#d9d9d9",
  backgroundColor: "#fff",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "rgba(0,0,0,.88)",
  resize: "vertical",
  fontFamily: "inter",
  transition: "all .2s",
  "&:focus": {
    border: "1px solid transparent",
    outline: "2px solid #F7C22D",
  },
});

const SuccessMessage = styled("div", {
  color: "#F7C22D",
  fontSize: "1.125rem",
  fontWeight: 600,
  marginTop: "8px",
  textAlign: "center",
});

export function WaitlistButton({
  disabled = false,
  lang,
  css,
}: {
  disabled?: boolean;
  lang: "en" | "zh";
  css?: any;
}): JSX.Element {
  return (
    <Button
      type="submit"
      style="landingCta"
      disabled={disabled}
      css={{
        display: "inline-flex",
        background: "#F7C22D",
        color: "#2B2B2B",
        minWidth: "160px",
        maxWidth: "20%",
        borderWidth: "0",
        padding: "10px 24px",
        fontWeight: 800,
        fontSize: "17px",
        justifyContent: "center",
        transition: "all 0.2s ease",
        "&:hover": {
          background: "#E0B129",
        },
        ...(css || {}),
      }}
    >
      {disabled
        ? lang === "zh"
          ? "提交中..."
          : "Submitting..."
        : lang === "zh"
          ? "加入等候名单"
          : "Join Waitlist"}
    </Button>
  );
}

export function WaitlistForm({
  addForm,
  lang,
  css,
}: {
  addForm: boolean;
  lang: "en" | "zh";
  css?: any;
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send the data to our API endpoint
      const response = await fetch(`${fetchEndpoint}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          feedback: feedback.trim(),
          date: new Date().toISOString().split("T")[0],
          language: lang,
        }),
      });

      console.log("Waitlist API response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join waitlist");
      }

      setIsSubmitted(true);
      // Clear form data after successful submission
      setEmail("");
      setFeedback("");
    } catch (err) {
      console.error("Waitlist submission error:", err);
      setError(
        lang === "zh"
          ? "提交失败，请稍后再试。"
          : "Submission failed. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} css={css}>
      {isSubmitted ? (
        <SuccessMessage>
          {lang === "zh" ? (
            <>
              感谢您的加入和反馈！
              <br />
              我们会在Beta版本准备就绪时通知您。
            </>
          ) : (
            <>
              Thank you for joining and your feedback!
              <br />
              We will notify you when the beta is ready.
            </>
          )}
        </SuccessMessage>
      ) : (
        <>
          <FormRow>
            <BorderedFormInput
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder={
                lang === "zh" ? "输入您的电子邮件" : "Enter your email"
              }
              required
              css={{
                width: "100%",
                height: "45px",
                fontSize: "1rem",
                fontColor: "$ruminerGray",
                marginTop: "40px",
              }}
              disabled={isSubmitting}
            />
          </FormRow>

          {addForm && (
            <FormRow>
              <FormLabel>
                {lang === "zh"
                  ? "分享您的想法（可选）"
                  : "Share your Thoughts (Optional)"}
              </FormLabel>
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  lang === "zh"
                    ? "分享您对Ruminer的期望或您希望看到的功能..."
                    : "Share your thoughts about Ruminer or features you would like to see..."
                }
                disabled={isSubmitting}
              />
            </FormRow>
          )}

          {error && (
            <div
              style={{ color: "red", fontSize: "0.875rem", marginTop: "-10px" }}
            >
              {error}
            </div>
          )}

          <WaitlistButton
            lang={lang}
            css={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            disabled={isSubmitting}
          />
        </>
      )}
    </FormWrapper>
  );
}
