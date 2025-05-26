import React from "react";
import Link from "next/link";

import { styled } from "../../tokens/stitches.config";
import { RuminerFullLogo } from "../elements/icons/RuminerFullLogo";
import { Box, HStack, VStack } from "../elements/LayoutPrimitives";

const FooterWrapper = styled(Box, {
  width: "100%",
  padding: "60px 24px 40px 24px",
  background: "#161616",
  borderTop: "1px solid rgba(255, 255, 255, 0.05)",

  "@md": {
    padding: "60px 48px 40px 48px",
  },
  "@lg": {
    padding: "60px 80px 40px 80px",
  },
});

const FooterContent = styled(Box, {
  maxWidth: "1440px",
  margin: "0 auto",
});

const FooterColumns = styled(Box, {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "40px",
  alignItems: "start",

  "@sm": {
    gridTemplateColumns: "1fr 1fr",
  },

  "@md": {
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
  },
});

const FooterColumn = styled(VStack, {
  gap: "10px",

  "& h3": {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#F7C22D",
    margin: "0 0 8px 0",
  },
});

const FooterLink = styled(Link, {
  color: "#898989",
  textDecoration: "none",
  fontSize: "0.875rem",
  transition: "color 0.2s ease",
  margin: "0",
  padding: "0",

  "&:hover": {
    color: "#EDEDED",
  },
});

const FooterDescription = styled("p", {
  color: "#898989",
  fontSize: "0.875rem",
  lineHeight: 1.6,
  margin: "16px 0",
});

const LogoSocialContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",

  "@sm": {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "end",
  },
});

const SocialLinks = styled(HStack, {
  gap: "16px",
  width: "fit-content",
  margin: "0 5%",
});

const SocialLink = styled(Link, {
  color: "#898989",
  transition: "color 0.2s ease",

  "&:hover": {
    color: "#F7C22D",
  },

  "& svg": {
    width: "30px",
    height: "30px",
  },
});

const NewsletterForm = styled("form", {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "16px",
});

const EmailInput = styled("input", {
  padding: "12px 16px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "6px",
  color: "#EDEDED",
  fontSize: "0.875rem",

  "&:focus": {
    outline: "none",
    borderColor: "rgba(247, 194, 45, 0.4)",
  },

  "&::placeholder": {
    color: "#898989",
  },
});

const SubscribeButton = styled("button", {
  padding: "12px 16px",
  background: "#F7C22D",
  border: "none",
  borderRadius: "6px",
  color: "#1A1A1A",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.2s ease",

  "&:hover": {
    background: "#E0B129",
  },
});

const Copyright = styled("p", {
  color: "#898989",
  fontSize: "0.75rem",
  textAlign: "center",
  margin: "40px 0 0 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",

  "@sm": {
    flexDirection: "row",
    justifyContent: "center",
    gap: "60px",
  },
});

const LegalLink = styled(Link, {
  color: "#898989",
  textDecoration: "none",
  fontSize: "0.75rem",
  transition: "color 0.2s ease",

  "&:hover": {
    color: "#EDEDED",
  },
});

export function LandingFooter({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const productLinks =
    lang === "zh"
      ? [
          { text: "功能", href: "#features" },
          { text: "路线图（即将推出）", href: "#roadmap" },
          { text: "价格（即将推出）", href: "#pricing" },
        ]
      : [
          { text: "Features", href: "#features" },
          { text: "Roadmap (coming soon)", href: "#roadmap" },
          { text: "Pricing (coming soon)", href: "#pricing" },
        ];

  const companyLinks =
    lang === "zh"
      ? [
          { text: "关于我们", href: "https://www.atmaware.com" },
          { text: "博客（即将推出）", href: "#blog" },
          // { text: '招贤纳士', href: '#careers' },
        ]
      : [
          { text: "About Us (coming soon)", href: "https://www.atmaware.com" },
          { text: "Blog (coming soon)", href: "#blog" },
          // { text: 'Careers', href: '#careers' },
        ];

  const supportLinks =
    lang === "zh"
      ? [
          { text: "常见问题", href: "#faq" },
          { text: "文档（即将推出）", href: "https://docs.ruminer.app" },
          { text: "联系我们", href: "mailto:poetry.coder@gmail.com" },
        ]
      : [
          { text: "FAQs", href: "#faq" },
          { text: "Docs (coming soon)", href: "https://docs.ruminer.app" },
          { text: "Contact Us", href: "mailto:poetry.coder@gmail.com" },
        ];

  const socialLinks = (
    <SocialLinks>
      <SocialLink href="https://twitter.com/ruminer_app" aria-label="Twitter">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="100"
          height="100"
          viewBox="0 0 30 30"
        >
          <path
            d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"
            fill="currentColor"
          />
        </svg>
      </SocialLink>
      {/* <SocialLink href="https://github.com/atmaware" aria-label="GitHub"> */}
      <SocialLink href="#github" aria-label="GitHub">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 19.0001C4 20.5001 4 16.5001 2 16.0001M16 22.0001V18.1301C16.0375 17.6532 15.9731 17.1739 15.811 16.7239C15.6489 16.2738 15.3929 15.8635 15.06 15.5201C18.2 15.1701 21.5 13.9801 21.5 8.52006C21.4997 7.12383 20.9627 5.78142 20 4.77006C20.4559 3.54857 20.4236 2.19841 19.91 1.00006C19.91 1.00006 18.73 0.65006 16 2.48006C13.708 1.85888 11.292 1.85888 9 2.48006C6.27 0.65006 5.09 1.00006 5.09 1.00006C4.57638 2.19841 4.54414 3.54857 5 4.77006C4.03013 5.78876 3.49252 7.14352 3.5 8.55006C3.5 13.9701 6.8 15.1601 9.94 15.5501C9.611 15.89 9.35726 16.2955 9.19531 16.74C9.03335 17.1845 8.96681 17.658 9 18.1301V22.0001"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SocialLink>
      <SocialLink href="#discord" aria-label="Discord">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="100"
          height="100"
          viewBox="0 0 24 24"
        >
          <path
            d="M 8.3164062 4.0039062 C 7.4484062 4.0039062 6.1811406 4.3226094 5.2441406 4.5996094 C 4.3771406 4.8556094 3.6552344 5.4479531 3.2402344 6.2519531 C 2.4062344 7.8649531 1.166625 11.064 1.015625 16 C 0.995625 16.67 1.2953594 17.314375 1.8183594 17.734375 C 2.8833594 18.589375 4.5907656 19.659375 7.0097656 19.984375 C 7.0847656 19.995375 7.1603281 20 7.2363281 20 C 7.7603281 20 8.2630781 19.758031 8.5800781 19.332031 L 9 18.65625 C 9 18.65625 10.653 19.019531 12 19.019531 L 12.013672 19.019531 C 13.360672 19.019531 15.013672 18.65625 15.013672 18.65625 L 15.433594 19.330078 C 15.751594 19.757078 16.253344 20 16.777344 20 C 16.853344 20 16.929859 19.994375 17.005859 19.984375 C 19.423859 19.659375 21.130313 18.589375 22.195312 17.734375 C 22.718312 17.314375 23.02 16.671953 23 16.001953 C 22.85 11.065953 21.607437 7.8659531 20.773438 6.2519531 C 20.358438 5.4489531 19.638484 4.8556094 18.771484 4.5996094 C 17.832484 4.3216094 16.565266 4.0039062 15.697266 4.0039062 C 15.443266 4.0039062 15.223641 4.0317031 15.056641 4.0957031 C 14.316641 4.3757031 14.001953 5.1445313 14.001953 5.1445312 C 14.001953 5.1445312 12.686625 4.9882813 12.015625 4.9882812 L 12 4.9882812 C 11.329 4.9882812 10.013672 5.1445312 10.013672 5.1445312 C 10.013672 5.1445312 9.6970313 4.37475 8.9570312 4.09375 C 8.7890312 4.03075 8.5704063 4.0039062 8.3164062 4.0039062 z M 8.3164062 5.5039062 C 8.3804063 5.5039062 8.4242188 5.5067656 8.4492188 5.5097656 C 8.5122188 5.5507656 8.5970469 5.6608906 8.6230469 5.7128906 C 8.8560469 6.2808906 9.4097187 6.6445312 10.011719 6.6445312 C 10.069719 6.6445312 10.1275 6.6417656 10.1875 6.6347656 C 10.6625 6.5787656 11.574672 6.4882812 12.013672 6.4882812 C 12.490672 6.4882812 13.484172 6.5947656 13.826172 6.6347656 C 13.889172 6.6417656 13.951672 6.6445312 14.013672 6.6445312 C 14.609672 6.6445312 15.145953 6.3081406 15.376953 5.7441406 C 15.414953 5.6631406 15.501453 5.5527188 15.564453 5.5117188 C 15.589453 5.5087187 15.633266 5.5058594 15.697266 5.5058594 C 16.231266 5.5058594 17.196703 5.7000625 18.345703 6.0390625 C 18.824703 6.1810625 19.213406 6.5004062 19.441406 6.9414062 C 20.148406 8.3094063 21.356 11.312828 21.5 16.048828 C 21.506 16.246828 21.415812 16.439406 21.257812 16.566406 C 19.933812 17.630406 18.435297 18.280953 16.779297 18.501953 C 16.732297 18.501953 16.68725 18.485984 16.65625 18.458984 L 16.390625 18.029297 C 16.833564 17.838865 17.256029 17.625199 17.640625 17.390625 C 17.994625 17.174625 18.105625 16.713375 17.890625 16.359375 C 17.674625 16.005375 17.212375 15.895375 16.859375 16.109375 C 15.733375 16.796375 13.795906 17.488281 12.003906 17.488281 C 10.216906 17.488281 8.2754844 16.796375 7.1464844 16.109375 C 6.7934844 15.894375 6.3321875 16.005375 6.1171875 16.359375 C 5.9021875 16.712375 6.0131875 17.175625 6.3671875 17.390625 C 6.7539143 17.625908 7.1782112 17.838346 7.6230469 18.029297 L 7.3574219 18.457031 C 7.3274219 18.483031 7.2817969 18.498047 7.2167969 18.498047 L 7.2070312 18.498047 C 5.5780312 18.279047 4.0818125 17.629406 2.7578125 16.566406 C 2.5998125 16.439406 2.509625 16.244875 2.515625 16.046875 C 2.659625 11.311875 3.8672187 8.3104063 4.5742188 6.9414062 C 4.8012188 6.5004062 5.1899219 6.1791094 5.6699219 6.0371094 C 6.8189219 5.6971094 7.7834062 5.5039062 8.3164062 5.5039062 z M 8.5 10 A 1.5 2 0 0 0 8.5 14 A 1.5 2 0 0 0 8.5 10 z M 15.5 10 A 1.5 2 0 0 0 15.5 14 A 1.5 2 0 0 0 15.5 10 z"
            fill="currentColor"
          />
        </svg>
      </SocialLink>
    </SocialLinks>
  );

  return (
    <FooterWrapper>
      <FooterContent>
        <FooterColumns>
          <FooterColumn>
            <LogoSocialContainer>
              <RuminerFullLogo href="/" />
              {socialLinks}
            </LogoSocialContainer>
            <FooterDescription>
              {lang === "zh"
                ? "Ruminer是一个知识管理平台，帮助您收集、组织和实现有效利用您的数字资源。完全拥有您的数据，同时获得AI驱动的洞察力。"
                : "Ruminer is a knowledge management platform that helps you collect, organize, and actionize your digital resources. Own your data completely while getting AI-powered insights."}
            </FooterDescription>

            {/* <NewsletterForm>
              <EmailInput 
                type="email" 
                placeholder={lang === 'zh' ? '您的电子邮件地址' : 'Your email address'} 
                aria-label={lang === 'zh' ? '电子邮件' : 'Email'}
              />
              <SubscribeButton type="submit">
                {lang === 'zh' ? '订阅邮件推送' : 'Subscribe to Newsletter'}
              </SubscribeButton>
            </NewsletterForm> */}
          </FooterColumn>

          <FooterColumn>
            <h3>{lang === "zh" ? "产品" : "Product"}</h3>
            {productLinks.map((link, index) => (
              <FooterLink key={index} href={link.href}>
                {link.text}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn>
            <h3>{lang === "zh" ? "公司" : "Company"}</h3>
            {companyLinks.map((link, index) => (
              <FooterLink key={index} href={link.href}>
                {link.text}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn>
            <h3>{lang === "zh" ? "支持" : "Support"}</h3>
            {supportLinks.map((link, index) => (
              <FooterLink key={index} href={link.href}>
                {link.text}
              </FooterLink>
            ))}
          </FooterColumn>
        </FooterColumns>

        <Copyright>
          <span>
            © Atmaware 2025 |{" "}
            {lang === "zh" ? "版权所有" : "All Rights Reserved"}
          </span>
          <span>
            <LegalLink href="/terms">
              {lang === "zh" ? "服务条款" : "Terms of Service"}
            </LegalLink>
            {" • "}
            <LegalLink href="/privacy">
              {lang === "zh" ? "隐私政策" : "Privacy Policy"}
            </LegalLink>
          </span>
        </Copyright>
      </FooterContent>
    </FooterWrapper>
  );
}
