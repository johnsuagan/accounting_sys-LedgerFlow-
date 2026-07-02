import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

function MiniBar({ height, className }: { height: string; className?: string }) {
    return <div className={cn('w-full rounded-sm', height, className)} />;
}

export function HeroDashboardMockup({ className }: { className?: string }) {
    return (
        <div className={cn('lf-mockup overflow-hidden', className)}>
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#E2E8F0]" />
                    <span className="size-2.5 rounded-full bg-[#E2E8F0]" />
                    <span className="size-2.5 rounded-full bg-[#E2E8F0]" />
                </div>
                <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[10px] text-[#64748B]">
                    ledgerflow.app/dashboard
                </div>
            </div>

            <div className="flex min-h-[420px]">
                <aside className="hidden w-44 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:block">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-md bg-[#2563EB] text-white">
                            <AppLogoIcon className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-[#0F172A]">LedgerFlow</span>
                    </div>
                    {['Dashboard', 'Journal Entries', 'General Ledger', 'T-Accounts', 'Financial Statements', 'Analysis'].map(
                        (item, i) => (
                            <div
                                key={item}
                                className={cn(
                                    'mb-1 rounded-md px-2 py-1.5 text-[10px] font-medium',
                                    i === 0 ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#64748B]',
                                )}
                            >
                                {item}
                            </div>
                        ),
                    )}
                </aside>

                <main className="flex-1 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Financial Overview</p>
                            <p className="text-sm font-semibold text-[#0F172A]">Practice Set — FY 2026</p>
                        </div>
                        <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-medium text-[#16A34A]">
                            Live
                        </span>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                        {[
                            { label: 'Revenue', value: '₱248,500', change: '+12.4%', up: true },
                            { label: 'Expenses', value: '₱186,200', change: '-3.1%', up: false },
                            { label: 'Net Income', value: '₱62,300', change: '+18.7%', up: true },
                            { label: 'Total Assets', value: '₱412,800', change: '+5.2%', up: true },
                        ].map((kpi) => (
                            <div key={kpi.label} className="rounded-xl border border-[#E2E8F0] bg-white p-2.5">
                                <p className="text-[9px] text-[#64748B]">{kpi.label}</p>
                                <p className="mt-0.5 font-mono text-xs font-bold text-[#0F172A]">{kpi.value}</p>
                                <p className={cn('mt-0.5 text-[9px] font-medium', kpi.up ? 'text-[#16A34A]' : 'text-[#F59E0B]')}>
                                    {kpi.change}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-5">
                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 lg:col-span-3">
                            <p className="mb-2 text-[10px] font-medium text-[#475569]">Revenue vs Expenses</p>
                            <div className="flex h-24 items-end gap-1.5">
                                {[40, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 92].map((h, i) => (
                                    <div key={i} className="flex flex-1 flex-col justify-end gap-0.5">
                                        <MiniBar height={`${h * 0.45}%`} className="bg-[#2563EB]/70" />
                                        <MiniBar height={`${h * 0.35}%`} className="bg-[#94A3B8]/50" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 lg:col-span-2">
                            <p className="mb-2 text-[10px] font-medium text-[#475569]">Recent Journal Entries</p>
                            <div className="space-y-2">
                                {[
                                    ['JE-0042', 'Service revenue', '₱15,000'],
                                    ['JE-0041', 'Rent payment', '₱8,500'],
                                    ['JE-0040', 'Utilities', '₱2,400'],
                                ].map(([num, desc, amt]) => (
                                    <div key={num} className="flex items-center justify-between text-[9px]">
                                        <div>
                                            <span className="font-mono font-medium text-[#2563EB]">{num}</span>
                                            <p className="text-[#64748B]">{desc}</p>
                                        </div>
                                        <span className="font-mono text-[#0F172A]">{amt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                            { label: 'ROA', value: '15.1%' },
                            { label: 'Current Ratio', value: '2.4×' },
                            { label: 'Health', value: 'Good' },
                        ].map((ratio) => (
                            <div key={ratio.label} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1.5 text-center">
                                <p className="text-[8px] text-[#64748B]">{ratio.label}</p>
                                <p className="text-[11px] font-bold text-[#16A34A]">{ratio.value}</p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export function DashboardPreviewMockup() {
    return (
        <div className="lf-mockup overflow-hidden">
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
                <p className="text-sm font-semibold text-[#0F172A]">Financial Analysis Dashboard</p>
                <p className="text-xs text-[#64748B]">Period: FY 2026 · Compared with previous year</p>
            </div>
            <div className="grid gap-4 bg-white p-5 md:grid-cols-2">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {['Total Revenue', 'Net Income', 'Total Assets', 'Total Equity'].map((label, i) => (
                            <div key={label} className="rounded-xl border border-[#E2E8F0] p-3">
                                <p className="text-[10px] text-[#64748B]">{label}</p>
                                <p className="font-mono text-sm font-bold text-[#0F172A]">
                                    {['₱248,500', '₱62,300', '₱412,800', '₱285,600'][i]}
                                </p>
                                <p className="text-[10px] font-medium text-[#16A34A]">↑ {[12.4, 18.7, 5.2, 8.1][i]}%</p>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl border border-[#E2E8F0] p-3">
                        <p className="mb-2 text-xs font-medium text-[#475569]">Net Income Trend</p>
                        <div className="flex h-20 items-end gap-1">
                            {[30, 42, 38, 50, 48, 55, 52, 60, 58, 68, 65, 72].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t bg-[#2563EB]/60" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="rounded-xl border border-[#E2E8F0] p-3">
                        <p className="mb-2 text-xs font-medium text-[#475569]">Business Health</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ['Profitability', 'Good'],
                                ['Liquidity', 'Excellent'],
                                ['Solvency', 'Good'],
                                ['Efficiency', 'Fair'],
                            ].map(([cat, status]) => (
                                <div key={cat} className="rounded-lg bg-[#F8FAFC] p-2">
                                    <p className="text-[10px] text-[#64748B]">{cat}</p>
                                    <p className="text-xs font-semibold text-[#16A34A]">{status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#E2E8F0] p-3">
                        <p className="mb-2 text-xs font-medium text-[#475569]">Top Revenue Accounts</p>
                        {[
                            ['4100 Service Revenue', '₱198,000'],
                            ['4110 Consulting Fees', '₱50,500'],
                        ].map(([name, amt]) => (
                            <div key={name} className="flex justify-between py-1 text-[10px]">
                                <span className="text-[#64748B]">{name}</span>
                                <span className="font-mono font-medium text-[#0F172A]">{amt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

type MockupVariant = 'journal' | 'ledger' | 'taccount' | 'trial' | 'statements' | 'ratios' | 'dashboard';

export function PageMockup({ variant, className }: { variant: MockupVariant; className?: string }) {
    const titles: Record<MockupVariant, string> = {
        journal: 'Journal Entries',
        ledger: 'General Ledger',
        taccount: 'T-Accounts',
        trial: 'Trial Balance',
        statements: 'Financial Statements',
        ratios: 'Financial Ratios',
        dashboard: 'Dashboard',
    };

    return (
        <div className={cn('lf-mockup overflow-hidden', className)}>
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                <div className="flex gap-1">
                    <span className="size-2 rounded-full bg-[#E2E8F0]" />
                    <span className="size-2 rounded-full bg-[#E2E8F0]" />
                    <span className="size-2 rounded-full bg-[#E2E8F0]" />
                </div>
                <span className="text-[10px] font-medium text-[#64748B]">{titles[variant]}</span>
            </div>
            <div className="bg-white p-3">
                {variant === 'journal' && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1 text-[8px] font-medium text-[#64748B]">
                            <span>Entry #</span>
                            <span>Date</span>
                            <span className="col-span-2">Description</span>
                        </div>
                        {[
                            ['JE-0042', '06/10', 'Service revenue billed'],
                            ['JE-0041', '06/08', 'Rent expense paid'],
                            ['JE-0040', '06/05', 'Cash received from client'],
                        ].map(([n, d, desc]) => (
                            <div key={n} className="grid grid-cols-4 gap-1 rounded bg-[#F8FAFC] py-1 text-[9px]">
                                <span className="font-mono text-[#2563EB]">{n}</span>
                                <span className="text-[#475569]">{d}</span>
                                <span className="col-span-2 text-[#64748B]">{desc}</span>
                            </div>
                        ))}
                    </div>
                )}
                {variant === 'ledger' && (
                    <div className="space-y-1">
                        <p className="text-[9px] font-medium text-[#475569]">1110 — Cash</p>
                        {[
                            ['06/05', '15,000', '', '15,000'],
                            ['06/08', '', '8,500', '6,500'],
                        ].map(([date, dr, cr, bal], i) => (
                            <div key={i} className="grid grid-cols-4 gap-1 text-[8px]">
                                <span className="text-[#64748B]">{date}</span>
                                <span className="font-mono text-[#16A34A]">{dr}</span>
                                <span className="font-mono text-[#F59E0B]">{cr}</span>
                                <span className="font-mono font-medium text-[#0F172A]">{bal}</span>
                            </div>
                        ))}
                    </div>
                )}
                {variant === 'taccount' && (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded border border-[#BBF7D0] bg-[#F0FDF4] p-2">
                            <p className="mb-1 text-center text-[8px] font-bold text-[#16A34A]">DEBIT</p>
                            <p className="font-mono text-[9px] text-[#0F172A]">15,000</p>
                            <p className="font-mono text-[9px] text-[#0F172A]">3,200</p>
                        </div>
                        <div className="rounded border border-[#FDE68A] bg-[#FFFBEB] p-2">
                            <p className="mb-1 text-center text-[8px] font-bold text-[#F59E0B]">CREDIT</p>
                            <p className="font-mono text-[9px] text-[#0F172A]">8,500</p>
                            <p className="font-mono text-[9px] text-[#0F172A]">2,400</p>
                        </div>
                    </div>
                )}
                {variant === 'trial' && (
                    <div className="space-y-1">
                        {[
                            ['1110 Cash', '6,500', ''],
                            ['4100 Revenue', '', '198,000'],
                            ['5100 Rent', '42,000', ''],
                        ].map(([acct, dr, cr]) => (
                            <div key={acct} className="grid grid-cols-3 gap-1 text-[8px]">
                                <span className="text-[#64748B]">{acct}</span>
                                <span className="font-mono text-[#0F172A]">{dr}</span>
                                <span className="font-mono text-[#0F172A]">{cr}</span>
                            </div>
                        ))}
                        <div className="mt-1 grid grid-cols-3 gap-1 border-t border-[#E2E8F0] pt-1 text-[8px] font-bold">
                            <span className="text-[#0F172A]">Totals</span>
                            <span className="font-mono text-[#16A34A]">412,800</span>
                            <span className="font-mono text-[#16A34A]">412,800</span>
                        </div>
                    </div>
                )}
                {variant === 'statements' && (
                    <div className="space-y-2 text-[8px]">
                        <p className="font-semibold text-[#0F172A]">Income Statement</p>
                        <div className="flex justify-between text-[#475569]">
                            <span>Service Revenue</span>
                            <span className="font-mono">198,000</span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                            <span>Rent Expense</span>
                            <span className="font-mono">(42,000)</span>
                        </div>
                        <div className="flex justify-between border-t border-[#E2E8F0] pt-1 font-semibold text-[#0F172A]">
                            <span>Net Income</span>
                            <span className="font-mono text-[#16A34A]">62,300</span>
                        </div>
                    </div>
                )}
                {variant === 'ratios' && (
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            ['ROA', '15.1%'],
                            ['ROE', '21.8%'],
                            ['Current', '2.4×'],
                            ['Debt', '32%'],
                        ].map(([name, val]) => (
                            <div key={name} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
                                <p className="text-[8px] text-[#64748B]">{name}</p>
                                <p className="text-xs font-bold text-[#2563EB]">{val}</p>
                            </div>
                        ))}
                    </div>
                )}
                {variant === 'dashboard' && (
                    <div className="grid grid-cols-2 gap-2">
                        {['Revenue', 'Expenses', 'Assets', 'Equity'].map((l, i) => (
                            <div key={l} className="rounded-lg border border-[#E2E8F0] p-2">
                                <p className="text-[8px] text-[#64748B]">{l}</p>
                                <p className="font-mono text-[10px] font-bold text-[#0F172A]">
                                    {['248K', '186K', '413K', '286K'][i]}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
