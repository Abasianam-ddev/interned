"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Ctx = { pending: boolean; state: ActionState };
const FormCtx = React.createContext<Ctx>({ pending: false, state: {} });

export function useActionForm() {
  return React.useContext(FormCtx);
}

export function useFieldError(name: string) {
  return React.useContext(FormCtx).state.fieldErrors?.[name];
}

/**
 * Form wrapper for server actions. Submits via a transition (so inputs are not reset when validation fails),
 * exposes pending/field errors via context and shows toasts for results.
 */
export function ActionForm({
  action,
  children,
  className,
  onSuccess,
  resetOnSuccess = false,
  toastOnSuccess = true,
  showErrorBanner = true,
  confirm,
  ...rest
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  onSuccess?: (state: ActionState) => void;
  resetOnSuccess?: boolean;
  toastOnSuccess?: boolean;
  showErrorBanner?: boolean;
  confirm?: string;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit">) {
  const [state, dispatch, pending] = React.useActionState(action, {});
  const formRef = React.useRef<HTMLFormElement>(null);
  const onSuccessRef = React.useRef(onSuccess);
  React.useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  React.useEffect(() => {
    if (!state.ts) return;
    if (state.ok) {
      if (toastOnSuccess && state.message) toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
      onSuccessRef.current?.(state);
    } else if (state.error && !showErrorBanner) {
      toast.error(state.error);
    }
  }, [state, resetOnSuccess, toastOnSuccess, showErrorBanner]);

  return (
    <FormCtx.Provider value={{ pending, state }}>
      <form
        ref={formRef}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          const fd = new FormData(e.currentTarget);
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          if (submitter?.name) fd.set(submitter.name, submitter.value);
          React.startTransition(() => dispatch(fd));
        }}
        {...rest}
      >
        {showErrorBanner && state.error && !state.ok && <FormError message={state.error} />}
        {children}
      </form>
    </FormCtx.Provider>
  );
}

export function FormError({ message, className }: { message: string; className?: string }) {
  return (
    <div role="alert" className={cn("mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", className)}>
      {message}
    </div>
  );
}

export function SubmitButton({ children, className, pendingText, ...props }: ButtonProps & { pendingText?: string }) {
  const { pending } = useActionForm();
  return (
    <Button type="submit" disabled={pending || props.disabled} className={className} {...props}>
      {pending && <Loader2 className="animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

/** Tiny error line bound to the enclosing ActionForm. */
export function FieldError({ name }: { name: string }) {
  const err = useFieldError(name);
  if (!err) return null;
  return <p className="mt-1.5 text-xs text-red-600">{err}</p>;
}
