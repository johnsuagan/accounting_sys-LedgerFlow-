import { RegisterSetupOverlay } from '@/components/auth/register-setup-overlay';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import SplitSimpleAuthLayout from '@/layouts/auth/split-simple-auth-layout';
import { BUSINESS_TYPES, type BusinessTypeValue } from '@/types/auth';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
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

            <SplitSimpleAuthLayout
                title="Create account"
                description="Set up your practice workspace to get started."
                formMaxWidth="420px"
            >
                <Head title="Create Account" />

                <form className="space-y-4" onSubmit={submit} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Alex Student"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            autoComplete="new-password"
                            placeholder="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="practice_set_name">
                            Practice set name <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </Label>
                        <Input
                            id="practice_set_name"
                            type="text"
                            placeholder="My Practice Set"
                            value={data.practice_set_name}
                            onChange={(e) => setData('practice_set_name', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.practice_set_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="business_type">
                            Business type <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </Label>
                        <select
                            id="business_type"
                            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-[#0F172A] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
                            value={data.business_type}
                            onChange={(e) => setData('business_type', e.target.value as BusinessTypeValue | '')}
                            disabled={processing}
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
                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="terms"
                                checked={data.terms}
                                onCheckedChange={(checked) => setData('terms', checked === true)}
                                disabled={processing}
                                className="mt-0.5"
                            />
                            <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-[#64748B]">
                                I agree to the{' '}
                                <a href="#" className="text-[#2563EB] hover:underline">
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-[#2563EB] hover:underline">
                                    Privacy Policy
                                </a>
                            </Label>
                        </div>
                        <InputError message={errors.terms} />
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]"
                        disabled={processing || !data.terms}
                    >
                        {processing && <LoaderCircle className="size-4 animate-spin" />}
                        Create practice workspace
                    </Button>

                    <p className="pt-1 text-center text-sm text-[#64748B]">
                        Already have an account?{' '}
                        <TextLink href={route('login')} className="text-[#2563EB]">
                            Sign in
                        </TextLink>
                    </p>
                </form>
            </SplitSimpleAuthLayout>
        </>
    );
}
