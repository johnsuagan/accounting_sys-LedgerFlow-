import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
    label: string;
    error?: string;
    hint?: string;
}

export function AuthInput({ icon: Icon, label, error, hint, className, id, ...props }: AuthInputProps) {
    const inputId = id ?? props.name;

    return (
        <div className="space-y-2">
            <label htmlFor={inputId} className="block text-sm font-medium text-[#0F172A]">
                {label}
            </label>
            <div className="relative">
                <Icon
                    className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#94A3B8]"
                    aria-hidden="true"
                />
                <input
                    id={inputId}
                    className={cn(
                        'auth-input',
                        error && 'auth-input-error',
                        className,
                    )}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
            </div>
            {hint && !error && (
                <p id={`${inputId}-hint`} className="text-xs text-[#64748B]">
                    {hint}
                </p>
            )}
            <InputError id={`${inputId}-error`} message={error} />
        </div>
    );
}
