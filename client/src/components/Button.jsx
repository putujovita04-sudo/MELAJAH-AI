import { cn } from "../utils/cn";

const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  teal: "btn-teal",
  gold: "btn-gold",
  ghost: "btn-ghost",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={cn("btn no-tap", VARIANTS[variant] ?? VARIANTS.primary, size === "sm" && "btn-sm", className)}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={20} strokeWidth={2.6} aria-hidden="true" />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon size={20} strokeWidth={2.6} aria-hidden="true" />}
    </button>
  );
}
