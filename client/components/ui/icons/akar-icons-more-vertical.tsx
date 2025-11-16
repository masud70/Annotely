import * as React from "react";

export function MoreVerticalIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="4" r="1" transform="rotate(90 12 4)"/><circle cx="12" cy="12" r="1" transform="rotate(90 12 12)"/><circle cx="12" cy="20" r="1" transform="rotate(90 12 20)"/>
    </svg>
  );
}
