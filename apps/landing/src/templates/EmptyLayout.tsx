import { Box, HStack, VStack } from "../elements/LayoutPrimitives";
import { PageMetaData } from "../patterns/PageMetaData";

type EmptyLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function EmptyLayout(props: EmptyLayoutProps): JSX.Element {
  return (
    <VStack css={{ width: "100%", height: "100%", minHeight: "100vh" }}>
      <PageMetaData path="/" title={props.title} />
      <HStack>{props.children}</HStack>
      <Box css={{ height: "200px", width: "100%" }} />
    </VStack>
  );
}
