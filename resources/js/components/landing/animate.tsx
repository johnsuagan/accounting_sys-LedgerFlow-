import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import type { CSSProperties, ReactNode } from 'react';

interface MountFadeProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

/** Page-load entrance animation (hero, navbar). */
export function MountFade({ children, className, delay = 0 }: MountFadeProps) {
    return (
        <div
            className={cn('lf-mount-fade-up', className)}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

/** Scroll-triggered fade-in for standalone blocks (e.g. CTA). */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
    const { ref, inView } = useInView();

    return (
        <div
            ref={ref}
            className={cn('lf-fade-in', inView && 'lf-fade-in-visible', className)}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

interface StaggerProps {
    children: ReactNode;
    className?: string;
}

/** Grid/list wrapper — children use StaggerItem for staggered reveal. */
export function Stagger({ children, className }: StaggerProps) {
    return <div className={cn('contents', className)}>{children}</div>;
}

interface StaggerItemProps {
    children: ReactNode;
    className?: string;
    index?: number;
    as?: 'div' | 'li';
}

export function StaggerItem({ children, className, index = 0, as: Tag = 'div' }: StaggerItemProps) {
    return (
        <Tag
            className={cn('lf-stagger-item', className)}
            style={{ '--lf-stagger-index': index } as CSSProperties}
        >
            {children}
        </Tag>
    );
}

interface AnimatedBarProps {
    height: number;
    index: number;
    className?: string;
    children?: ReactNode;
}

/** Chart bar that grows when scrolled into view. */
export function AnimatedBar({ height, index, className, children }: AnimatedBarProps) {
    const { ref, inView } = useInView({ threshold: 0.2 });

    return (
        <div ref={ref} className={cn('group/bar flex h-full flex-1 flex-col items-center justify-end gap-1', className)}>
            <div
                className={cn('lf-bar-inner w-full rounded-t-md bg-[#2563EB]/70', inView && 'lf-bar-inner-visible')}
                style={{ '--lf-bar-height': `${height}%`, '--lf-stagger-index': index } as CSSProperties}
            />
            {children}
        </div>
    );
}
