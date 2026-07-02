import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import type { ReactNode } from 'react';

interface LandingSectionProps {
    id?: string;
    children: ReactNode;
    className?: string;
    containerClassName?: string;
}

export function LandingSection({ id, children, className, containerClassName }: LandingSectionProps) {
    const { ref, inView } = useInView();

    return (
        <section
            id={id}
            ref={ref}
            className={cn('lf-section', inView && 'lf-section-visible', className)}
        >
            <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', containerClassName)}>{children}</div>
        </section>
    );
}

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}

export function SectionHeader({ eyebrow, title, description, align = 'center' }: SectionHeaderProps) {
    return (
        <div className={cn('mb-12 max-w-3xl', align === 'center' && 'mx-auto text-center')}>
            {eyebrow && <p className="lf-eyebrow mb-3">{eyebrow}</p>}
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">{title}</h2>
            {description && (
                <p className="mt-4 text-lg leading-relaxed text-[#64748B]">{description}</p>
            )}
        </div>
    );
}
