import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingNavbarProps {
    isAuthenticated: boolean;
}

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Analysis', href: '#analysis' },
    { label: 'Practice Sets', href: '#practice-sets' },
    { label: 'Technology', href: '#technology' },
];

export function LandingNavbar({ isAuthenticated }: LandingNavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'lf-nav-enter fixed inset-x-0 top-0 z-50 transition-all duration-200',
                scrolled
                    ? 'border-b border-[#BFDBFE] bg-white/90 shadow-sm shadow-blue-500/5 backdrop-blur-md'
                    : 'border-b border-transparent bg-[#EFF6FF]/60 backdrop-blur-sm',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563EB]">
                        <AppLogoIcon className="size-5 fill-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-[#0F172A]">LedgerFlow</span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {isAuthenticated ? (
                        <Button asChild className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]">
                            <Link href={route('dashboard')}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="text-[#475569] hover:bg-[#EFF6FF] hover:text-[#0F172A]">
                                <Link href={route('login')}>Log in</Link>
                            </Button>
                            <Button asChild className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]">
                                <Link href={route('register')}>Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="rounded-lg p-2 text-[#475569] md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 md:hidden">
                    <nav className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-[#475569]"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-2 flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
                            {isAuthenticated ? (
                                <Button asChild className="w-full rounded-lg bg-[#2563EB]">
                                    <Link href={route('dashboard')}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="outline" className="w-full rounded-lg border-[#E2E8F0]">
                                        <Link href={route('login')}>Log in</Link>
                                    </Button>
                                    <Button asChild className="w-full rounded-lg bg-[#2563EB]">
                                        <Link href={route('register')}>Get Started</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
