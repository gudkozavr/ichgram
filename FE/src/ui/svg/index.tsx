import { SVGProps } from "react";

export interface SVGIconP extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const SvgIcon = ({
  width,
  height,
  size,
  viewBox,
  children,
  ...props
}: SVGIconP) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox || "0 0 24 24"}
        width={size || width || 24}
        height={size || height || 24}
        {...props}
      >
        {children}
      </svg>
    </>
  );
};
