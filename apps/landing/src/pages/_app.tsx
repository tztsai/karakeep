import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // Apply theme on client-side only to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <Component {...pageProps} />;
  }

  return <Component {...pageProps} />;
}
