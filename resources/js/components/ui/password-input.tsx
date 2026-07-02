import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                type={visible ? 'text' : 'password'}
                className={cn('pr-10', className)}
                disabled={disabled}
                {...props}
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                disabled={disabled}
            >
                {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
        </div>
    );
}
