export const BUSINESS_TYPES = [
    { value: 'service_business', label: 'Service Business' },
    { value: 'merchandising_business', label: 'Merchandising Business' },
    { value: 'manufacturing_business', label: 'Manufacturing Business' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'laundry_shop', label: 'Laundry Shop' },
    { value: 'coffee_shop', label: 'Coffee Shop' },
    { value: 'retail_store', label: 'Retail Store' },
    { value: 'custom', label: 'Custom' },
] as const;

export type BusinessTypeValue = (typeof BUSINESS_TYPES)[number]['value'];

export interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    checks: {
        minLength: boolean;
        hasLetter: boolean;
        hasNumber: boolean;
    };
}

export function getPasswordStrength(password: string): PasswordStrength {
    const checks = {
        minLength: password.length >= 8,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /\d/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;

    if (password.length === 0) {
        return { score: 0, label: '', color: '#E2E8F0', checks };
    }

    if (passed <= 1) {
        return { score: 1, label: 'Weak', color: '#EF4444', checks };
    }

    if (passed === 2) {
        return { score: 2, label: 'Fair', color: '#F59E0B', checks };
    }

    return { score: 3, label: 'Strong', color: '#16A34A', checks };
}
