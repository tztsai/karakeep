import { useRouter } from "next/router";

import { EmptyLayout } from "../templates/EmptyLayout";
import { TermsAndConditions } from "../templates/TermsAndConditions";

export default function Terms(): JSX.Element {
  const router = useRouter();
  const appEmbedViewQuery = router.query.isAppEmbedView as string | undefined;
  const isAppEmbedView = (appEmbedViewQuery ?? "").length > 0;

  if (isAppEmbedView) {
    return <TermsAndConditions />;
  } else {
    return (
      <EmptyLayout title="Terms and Conditions">
        <TermsAndConditions />
      </EmptyLayout>
    );
  }
}
