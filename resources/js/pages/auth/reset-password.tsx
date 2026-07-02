import { AuthInput } from '@/components/auth/auth-input';
import { AuthPasswordField } from '@/components/auth/auth-password-field';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Set a New Password" description="Choose a strong password for your LedgerFlow account.">
            <Head title="Reset Password" />

            <form className="space-y-5" onSubmit={submit} noValidate>
                <AuthInput
                    icon={Mail}
                    label="Email Address"
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={data.email}
                    readOnly
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    className="bg-[#F8FAFC] text-[#64748B]"
                />

                <AuthPasswordField
                    id="password"
                    label="New Password"
                    name="password"
                    autoComplete="new-password"
                    value={data.password}
                    autoFocus
                    required
                    placeholder="Create a new password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    showStrength
                />

                <AuthPasswordField
                    id="password_confirmation"
                    label="Confirm Password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    required
                    placeholder="Confirm your new password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <AuthSubmitButton loading={processing}>Reset Password</AuthSubmitButton>
            </form>
        </AuthLayout>
    );
}
