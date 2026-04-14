interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export function LoadingSpinner({
  className = "",
  size = "md",
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizes[size]} rounded-full border-primary/20 border-t-primary animate-spin`}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-[300px]"
      data-ocid="loading_state"
    >
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
