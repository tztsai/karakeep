import { useRouter } from "next/router";

import { EmptyLayout } from "../templates/EmptyLayout";
import { PrivacyPolicy } from "../templates/PrivacyPolicy";

export default function Terms(): JSX.Element {
  const router = useRouter();
  const appEmbedViewQuery = router.query.isAppEmbedView as string | undefined;
  const isAppEmbedView = (appEmbedViewQuery ?? "").length > 0;

  if (isAppEmbedView) {
    return <PrivacyPolicy />;
  } else {
    return (
      <EmptyLayout title="Privacy Policy">
        <PrivacyPolicy />
      </EmptyLayout>
    );
  }
}
