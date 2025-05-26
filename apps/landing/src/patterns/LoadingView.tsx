import { applyStoredTheme } from "../../lib/themeUpdater";
import { VStack } from "../elements/LayoutPrimitives";

type LoadingViewProps = {
  bgColor?: string;
};

export function LoadingView(props: LoadingViewProps): JSX.Element {
  applyStoredTheme();

  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        bg: props.bgColor ?? "$grayBase",
        height: "100vh",
        width: "100vw",
      }}
    />
  );
}
