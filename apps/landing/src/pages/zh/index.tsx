import { PageMetaData } from "../../patterns/PageMetaData";
import { About } from "../../templates/About";

export default function LandingPage(): JSX.Element {
  return (
    <>
      <PageMetaData
        title="Ruminer"
        path="/"
        ogImage="/static/images/og-homepage.png"
        description="Ruminer 为认真读者提供免付费read-it-later应用程序"
      />

      <About lang="zh" />
    </>
  );
}
