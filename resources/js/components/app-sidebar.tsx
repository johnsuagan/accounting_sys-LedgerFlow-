import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BookText,
    Droplets,
    FileSpreadsheet,
    Gauge,
    History,
    LayoutGrid,
    Lightbulb,
    ListTree,
    Scale,
    ScrollText,
    SplitSquareHorizontal,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

const navGroups: NavGroup[] = [
    {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Accounting',
        items: [
            {
                title: 'Chart of Accounts',
                url: '/accounting/accounts',
                icon: ListTree,
            },
            {
                title: 'Journal Entries',
                url: '/accounting/journal-entries',
                icon: BookText,
            },
            {
                title: 'T-Accounts',
                url: '/accounting/t-accounts',
                icon: SplitSquareHorizontal,
            },
            {
                title: 'General Ledger',
                url: '/accounting/general-ledger',
                icon: ScrollText,
            },
            {
                title: 'Trial Balance',
                url: '/accounting/trial-balance',
                icon: Scale,
            },
            {
                title: 'Financial Statements',
                url: '/accounting/financial-statements',
                icon: FileSpreadsheet,
            },
            {
                title: 'Audit Trail',
                url: '/accounting/audit-trail',
                icon: History,
            },
        ],
    },
    {
        title: 'Financial Analysis',
        items: [
            {
                title: 'Dashboard',
                url: '/financial-analysis/dashboard',
                icon: Gauge,
            },
            {
                title: 'Profitability Ratios',
                url: '/financial-analysis/profitability',
                icon: TrendingUp,
            },
            {
                title: 'Liquidity Ratios',
                url: '/financial-analysis/liquidity',
                icon: Droplets,
            },
            {
                title: 'Solvency Ratios',
                url: '/financial-analysis/solvency',
                icon: Wallet,
            },
            {
                title: 'Efficiency Ratios',
                url: '/financial-analysis/efficiency',
                icon: Activity,
            },
            {
                title: 'Trend Analysis',
                url: '/financial-analysis/trends',
                icon: BarChart3,
            },
            {
                title: 'Financial Insights',
                url: '/financial-analysis/insights',
                icon: Lightbulb,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>
        </Sidebar>
    );
}
