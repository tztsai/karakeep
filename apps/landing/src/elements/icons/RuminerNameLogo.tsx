import Image from "next/image";

import { config } from "../../../tokens/stitches.config";
import { StyledText } from "../../elements/StyledText";
import { RuminerLogoBase } from "./RuminerLogoBase";

export function RuminerNameLogoImage(): JSX.Element {
  return (
    <Image
      src="/static/icons/logo-landing.svg"
      alt="Image of Ruminer name with Logo"
      width={136}
      height={27}
    />
  );
}

type RuminerLogoProps = {
  size: number;
  strokeColor: string;
};

export function RuminerSmallLogo(props: RuminerLogoProps): JSX.Element {
  return (
    <Image
      src="/static/icons/logo-name.svg"
      alt="Ruminer Logo"
      width={18}
      height={19}
      style={{ filter: `stroke(${props.strokeColor})` }}
    />
  );
}

export function RuminerLogoIcon(props: RuminerLogoProps): JSX.Element {
  return (
    <Image
      src="/static/icons/logo-name.svg"
      alt="Ruminer Logo Icon"
      width={props.size}
      height={props.size}
      style={{ filter: `stroke(${props.strokeColor})` }}
    />
  );
}

export type RuminerNameLogoProps = {
  color?: string;
  href?: string;
  showTitle?: boolean;
};

export function RuminerNameLogo(props: RuminerNameLogoProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid;

  return (
    <RuminerLogoBase {...props}>
      <RuminerLogoIcon size={48} strokeColor={fillColor}></RuminerLogoIcon>
      {props.showTitle && (
        <StyledText
          style="logoTitle"
          css={{ color: fillColor, paddingLeft: "12px" }}
        >
          Ruminer
        </StyledText>
      )}
    </RuminerLogoBase>
  );
}
