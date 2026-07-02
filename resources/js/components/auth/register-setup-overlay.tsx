import { cn } from '@/lib/utils';
import { Check, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const SETUP_STEPS = [
    'Creating Practice Set',
    'Creating Fiscal Year',
    'Generating Chart of Accounts',
] as const;

interface RegisterSetupOverlayProps {
    visible: boolean;
    userName?: string;
}

export function RegisterSetupOverlay({ visible, userName }: RegisterSetupOverlayProps) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (!visible) {
            setActiveStep(0);
            return;
        }

        const interval = window.setInterval(() => {
            setActiveStep((step) => Math.min(step + 1, SETUP_STEPS.length - 1));
        }, 900);

        return () => window.clearInterval(interval);
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <div className="auth-setup-overlay" role="dialog" aria-modal="true" aria-labelledby="setup-title">
            <div className="auth-setup-card">
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                    <LoaderCircle className="size-7 animate-spin text-[#2563EB]" />
                </div>

                <h2 id="setup-title" className="text-center text-2xl font-bold text-[#0F172A]">
                    Welcome to LedgerFlow{userName ? `, ${userName.split(' ')[0]}` : ''}!
                </h2>
                <p className="mt-2 text-center text-sm text-[#64748B]">
                    Your practice workspace has been created successfully.
                </p>
                <p className="mt-1 text-center text-sm font-medium text-[#475569]">
                    Preparing your accounting environment...
                </p>

                <ol className="mt-8 space-y-3">
                    {SETUP_STEPS.map((step, index) => {
                        const done = index < activeStep;
                        const current = index === activeStep;

                        return (
                            <li
                                key={step}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-300',
                                    done && 'border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]',
                                    current && !done && 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]',
                                    !done && !current && 'border-[#E2E8F0] bg-white text-[#94A3B8]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        done && 'bg-[#16A34A] text-white',
                                        current && !done && 'bg-[#2563EB] text-white',
                                        !done && !current && 'bg-[#F1F5F9] text-[#94A3B8]',
                                    )}
                                >
                                    {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                                </span>
                                <span className="font-medium">{step}</span>
                                {current && !done && (
                                    <LoaderCircle className="ml-auto size-4 animate-spin" aria-hidden="true" />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}
