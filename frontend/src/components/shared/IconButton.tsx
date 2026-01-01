import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { Spinner } from "../ui/spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive [&>svg]:flex-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-gray-300 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "h-9 w-9 p-2",
        "icon-sm": "h-8 w-8 p-1.5",
        "icon-lg": "h-10 w-10 p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type IconButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    busy?: boolean;
  };

export function IconButton({
  className,
  variant,
  size,
  asChild = false,
  startIcon,
  endIcon,
  busy = false,
  children,
  disabled,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      disabled={disabled || busy}
      aria-busy={busy}
      className={clsx(
        buttonVariants({ variant, size }),
        busy && "cursor-not-allowed opacity-80",
        className
      )}
      {...props}
    >
      {busy ? (
        <Spinner />
      ) : (
        <>
          {startIcon && (
            <span className="inline-flex items-center">{startIcon}</span>
          )}
          {children}
          {endIcon && (
            <span className="inline-flex items-center">{endIcon}</span>
          )}
        </>
      )}
    </Comp>
  );
}
