import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: ReactNode;
}

export function AuthSubmitButton({ loading, children, className, disabled, ...props }: AuthSubmitButtonProps) {
    return (
        <button
            type="submit"
            className={cn('auth-submit-btn', className)}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            <span>{children}</span>
        </button>
    );
}

interface AuthSecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export function AuthSecondaryButton({ children, className, ...props }: AuthSecondaryButtonProps) {
    return (
        <button type="button" className={cn('auth-secondary-btn', className)} {...props}>
            {children}
        </button>
    );
}
