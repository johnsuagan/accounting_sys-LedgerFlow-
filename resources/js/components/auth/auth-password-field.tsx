import InputError from '@/components/input-error';
import { getPasswordStrength } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useMemo, useState, type InputHTMLAttributes } from 'react';

interface AuthPasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
    value: string;
    showStrength?: boolean;
}

export function AuthPasswordField({
    label,
    error,
    value,
    showStrength = false,
    className,
    id,
    ...props
}: AuthPasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name ?? 'password';
    const strength = useMemo(() => getPasswordStrength(value), [value]);

    return (
        <div className="space-y-2">
            {label ? (
                <label htmlFor={inputId} className="block text-sm font-medium text-[#0F172A]">
                    {label}
                </label>
            ) : null}
            <div className="relative">
                <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#94A3B8]"
                    aria-hidden="true"
                />
                <input
                    id={inputId}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    className={cn('auth-input pr-11', error && 'auth-input-error', className)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${inputId}-error` : showStrength ? `${inputId}-strength` : undefined}
                    {...props}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
            </div>

            {showStrength && value.length > 0 && (
                <div id={`${inputId}-strength`} className="space-y-2" aria-live="polite">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                            {[1, 2, 3].map((level) => (
                                <div
                                    key={level}
                                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                                    style={{
                                        backgroundColor: strength.score >= level ? strength.color : '#E2E8F0',
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium" style={{ color: strength.color }}>
                            {strength.label}
                        </span>
                    </div>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
                        <li className={cn(strength.checks.minLength && 'text-[#16A34A]')}>8+ characters</li>
                        <li className={cn(strength.checks.hasLetter && 'text-[#16A34A]')}>Contains a letter</li>
                        <li className={cn(strength.checks.hasNumber && 'text-[#16A34A]')}>Contains a number</li>
                    </ul>
                </div>
            )}

            <InputError id={`${inputId}-error`} message={error} />
        </div>
    );
}
