import { AuthInput } from '@/components/auth/auth-input';
import { AuthPasswordField } from '@/components/auth/auth-password-field';
import { RegisterSetupOverlay } from '@/components/auth/register-setup-overlay';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { BUSINESS_TYPES, type BusinessTypeValue } from '@/types/auth';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Mail, User } from 'lucide-react';
import { FormEventHandler } from 'react';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    practice_set_name: string;
    business_type: BusinessTypeValue | '';
    terms: boolean;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        practice_set_name: '',
        business_type: '',
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <RegisterSetupOverlay visible={processing} userName={data.name} />

            <AuthLayout
                title="Create Your Practice Workspace"
                description="Start learning accounting using a professional accounting platform."
            >
                <Head title="Create Account" />

                <form className="space-y-5" onSubmit={submit} noValidate>
                    <AuthInput
                        icon={User}
                        label="Full Name"
                        id="name"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        placeholder="Alex Student"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                        error={errors.name}
                    />

                    <AuthInput
                        icon={Mail}
                        label="Email Address"
                        id="email"
                        type="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        placeholder="you@school.edu"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
                        error={errors.email}
                    />

                    <AuthPasswordField
                        id="password"
                        label="Password"
                        required
                        tabIndex={3}
                        autoComplete="new-password"
                        placeholder="Create a secure password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
                        error={errors.password}
                        showStrength
                    />

                    <AuthPasswordField
                        id="password_confirmation"
                        label="Confirm Password"
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        disabled={processing}
                        error={errors.password_confirmation}
                    />

                    <AuthInput
                        icon={Building2}
                        label="Practice Set Name"
                        id="practice_set_name"
                        type="text"
                        tabIndex={5}
                        placeholder="My Practice Set"
                        value={data.practice_set_name}
                        onChange={(e) => setData('practice_set_name', e.target.value)}
                        disabled={processing}
                        error={errors.practice_set_name}
                        hint="Optional — defaults to your name if left blank."
                    />

                    <div className="space-y-2">
                        <label htmlFor="business_type" className="block text-sm font-medium text-[#0F172A]">
                            Business Type <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </label>
                        <select
                            id="business_type"
                            className="auth-select"
                            value={data.business_type}
                            onChange={(e) => setData('business_type', e.target.value as BusinessTypeValue | '')}
                            disabled={processing}
                            tabIndex={6}
                        >
                            <option value="">Select a business type</option>
                            {BUSINESS_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.business_type} />
                    </div>

                    <div className="space-y-2">
                        <div className="auth-checkbox-row">
                            <Checkbox
                                id="terms"
                                checked={data.terms}
                                onCheckedChange={(checked) => setData('terms', checked === true)}
                                tabIndex={7}
                                disabled={processing}
                            />
                            <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-[#475569]">
                                I agree to the{' '}
                                <a href="#" className="auth-link">
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" className="auth-link">
                                    Privacy Policy
                                </a>
                            </Label>
                        </div>
                        <InputError message={errors.terms} />
                    </div>

                    <AuthSubmitButton loading={processing} tabIndex={8} disabled={!data.terms}>
                        Create Practice Workspace
                    </AuthSubmitButton>

                    <p className="text-center text-sm text-[#64748B]">
                        Already have an account?{' '}
                        <TextLink href={route('login')} className="auth-link" tabIndex={9}>
                            Sign In
                        </TextLink>
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}
