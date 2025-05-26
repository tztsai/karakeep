import { useRouter } from "next/router";

import { LoadingView } from "../patterns/LoadingView";
import { PageMetaData } from "../patterns/PageMetaData";
import { About } from "../templates/About";

export default function LandingPage(): JSX.Element {
  const router = useRouter();

  return (
    <>
      <PageMetaData
        title="Ruminer"
        path="/"
        ogImage="/static/images/og-homepage.png"
        description="Ruminer is the free, open source, read-it-later app for serious readers."
      />

      {/* {(isLoading || !router.isReady) ? */}
      {!router.isReady ? (
        <LoadingView bgColor="#FEFCF5" />
      ) : (
        <About lang="en" />
      )}
    </>
  );
}
