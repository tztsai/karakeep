import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { styled } from "../../tokens/stitches.config";
import { Button } from "../elements/Button";
import { RuminerFullLogo } from "../elements/icons/RuminerFullLogo";
import { Box, HStack, VStack } from "../elements/LayoutPrimitives";
import { WaitlistButton } from "./CTASection";

const HeaderWrapper = styled(Box, {
  position: "sticky",
  top: 0,
  zIndex: 100,
  width: "100%",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(8px)",
  padding: "16px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",

  "@md": {
    padding: "16px 48px",
  },
  "@lg": {
    padding: "16px 80px",
  },
  "@smDown": {
    "& img": {
      display: "none",
    },
  },
});

const NavLinks = styled(HStack, {
  gap: "32px",
  display: "none",
  "@md": {
    display: "flex",
  },
});

const NavLink = styled(Link, {
  color: "#EDEDED",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 500,
  transition: "color 0.2s ease",
  "&:hover": {
    color: "#F7C22D", // Royal yellow
  },
});

const LanguageSelector = styled("div", {
  position: "relative",
  margin: "auto 32px",
});

const LanguageButton = styled(Button, {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "transparent !important",
  color: "#EDEDED",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",

  "&:hover": {
    background: "rgba(255, 255, 255, 0.05)",
  },
});

const LanguageDropdown = styled(VStack, {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: "8px",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(8px)",
  borderRadius: "6px",
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
  zIndex: 200,
  minWidth: "120px",
});

const LanguageOption = styled("button", {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "10px 16px",
  fontSize: "14px",
  color: "#EDEDED",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  cursor: "pointer",
  transition: "all 0.15s ease",

  "&:last-child": {
    borderBottom: "none",
  },

  "&:hover": {
    background: "rgba(247, 194, 45, 0.1)",
    color: "#F7C22D",
  },

  "&.active": {
    color: "#F7C22D",
    background: "rgba(247, 194, 45, 0.05)",
  },
});

const HeaderStart = styled(HStack, {
  gap: "16px",
  display: "flex",
  alignItems: "center",
});

// Chevron down icon component
const ChevronDownIcon = () => (
  <svg
    width="12"
    height="6"
    viewBox="0 0 12 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L6 5L11 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LoginButton = ({
  lang,
  css,
}: {
  lang: "en" | "zh";
  css?: any;
}): JSX.Element => {
  return (
    <Link
      href="/auth/email-login"
      style={{
        display: "inline-flex",
        background: "transparent",
        border: "1px solid #F7C22D",
        width: "160px",
        fontSize: "16px",
        justifyContent: "center",
        color: "#F7C22D",
        transition: "all 0.2s ease",
        borderRadius: "10px",
        padding: "12px 100px",
        textDecoration: "none",
        alignItems: "center",
        ...(css || {}),
      }}
    >
      {lang === "zh" ? `登录` : `Login`}
    </Link>
  );
};

export function LandingHeader({ lang }: { lang: "en" | "zh" }): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Language options
  const languages = [
    { code: "en", label: "English" },
    { code: "zh", label: "简体中文" },
  ];

  // Handle language change
  const handleLanguageChange = (langCode: "en" | "zh") => {
    // Update URL with the new language code
    const currentUrl = new URL(window.location.href);
    const currentPath = currentUrl.pathname;

    // Determine the new path
    let newPath = currentPath;
    if (currentPath.startsWith("/zh") && langCode === "en") {
      newPath = currentPath.substring(3); // Remove /zh prefix
      if (newPath === "") newPath = "/";
    } else if (!currentPath.startsWith("/zh") && langCode === "zh") {
      newPath = `/zh${currentPath === "/" ? "" : currentPath}`;
    }

    // Navigate to the new path
    window.location.href = `${currentUrl.origin}${newPath}${currentUrl.search}`;

    setIsDropdownOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current language display text
  const currentLanguage =
    languages.find((l) => l.code === lang)?.label || "English";

  return (
    <HeaderWrapper>
      <HeaderStart>
        <RuminerFullLogo href="/" />

        <LanguageSelector ref={dropdownRef}>
          <LanguageButton
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
          >
            {currentLanguage}
            <ChevronDownIcon />
          </LanguageButton>

          {isDropdownOpen && (
            <LanguageDropdown>
              {languages.map((language) => (
                <LanguageOption
                  key={language.code}
                  onClick={() =>
                    handleLanguageChange(language.code as "en" | "zh")
                  }
                  className={lang === language.code ? "active" : ""}
                >
                  {language.label}
                </LanguageOption>
              ))}
            </LanguageDropdown>
          )}
        </LanguageSelector>
      </HeaderStart>

      <NavLinks>
        <NavLink href="#features">
          {lang === "zh" ? "功能" : "Features"}
        </NavLink>
        <NavLink href="#why-ruminer">
          {lang === "zh" ? "为什么选择 Ruminer" : "Why Ruminer"}
        </NavLink>
        <NavLink href="#faq">{lang === "zh" ? "常见问题" : "FAQ"}</NavLink>
      </NavLinks>

      <Button
        css={{
          background: "#1A1A1A",
          padding: "10px 20px",
          fontSize: "20px",
          border: "1px solid #BCBCBC",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#F7C22D",
          },
          "& a": {
            fontWeight: 720,
            textDecoration: "none",
            color: "#F7C22D",
          },
        }}
      >
        <a href="#beta">{lang === "zh" ? "我有兴趣！" : "Count Me In!"}</a>
      </Button>
    </HeaderWrapper>
  );
}
