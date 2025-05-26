import Image from "next/image";

import { config } from "../../../tokens/stitches.config";
import { RuminerLogoBase } from "./RuminerLogoBase";

export type RuminerFullLogoProps = {
  color?: string;
  href?: string;
  showTitle?: boolean;
};

export function RuminerFullLogo(props: RuminerFullLogoProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid;

  return (
    <RuminerLogoBase {...props}>
      <Image
        src="/static/icons/logo-landing.svg"
        alt="Ruminer Logo"
        width={225}
        height={60}
        style={{
          filter:
            fillColor !== config.theme.colors.graySolid
              ? `invert(1)`
              : undefined,
        }}
      />
    </RuminerLogoBase>
  );
}
