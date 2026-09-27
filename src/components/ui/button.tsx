import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
        dark: "bg-brand-900 text-white hover:bg-brand-950 shadow-sm",
        outline: "border border-ink/80 bg-white text-ink hover:bg-brand-50",
        secondary: "border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50",
        soft: "bg-brand-100 text-brand-800 hover:bg-brand-200",
        ghost: "text-ink hover:bg-brand-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
        "danger-outline": "border border-red-200 bg-white text-red-600 hover:bg-red-50",
        link: "px-0 text-brand-700 underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
