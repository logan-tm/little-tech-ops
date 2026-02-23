import { mergeProps, useRender } from "@base-ui/react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  "inline-flex justify-center items-center cursor-pointer hover:opacity-90",
  {
    variants: {
      variant: {
        default: "",
        primary: "bg-blue-400",
        destructive: "bg-red-400",
        warning: "bg-yellow-400",
      },
      size: {
        default: "h-12 px-4",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    useRender.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {}

export default function Button(props: ButtonProps) {
  const mergedProps = mergeProps(props, {
    className: twMerge(
      buttonVariants({ variant: props.variant, size: props.size }),
      props.className,
    ),
  });

  const element = useRender({
    defaultTagName: "button",
    render: props.render,
    props: mergedProps,
  });

  return element;
}
