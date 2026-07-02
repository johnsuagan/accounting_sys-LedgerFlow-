import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface CompanyCurrent {
    id: number;
    name: string;
    role: string;
}

export interface CompanyShared {
    current: CompanyCurrent | null;
    requiresSelection: boolean;
    accessible: Array<{ id: number; name: string }>;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    welcome?: boolean | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    company?: CompanyShared;
    flash?: FlashMessages;
    [key: string]: unknown;
}

export * from './accounting';
export * from './financial-analysis';
export * from './general-ledger';
export * from './journal-entry';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
