import { AuthInput } from '@/components/auth/auth-input';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Reset Your Password"
            description="Enter your email address and we'll send you a secure reset link."
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-6 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-center text-sm font-medium text-[#16A34A]">
                    {status}
                </div>
            )}

            <form className="space-y-5" onSubmit={submit} noValidate>
                <AuthInput
                    icon={Mail}
                    label="Email Address"
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={data.email}
                    autoFocus
                    required
                    placeholder="you@school.edu"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <AuthSubmitButton loading={processing}>Send Reset Link</AuthSubmitButton>

                <p className="text-center text-sm text-[#64748B]">
                    Remember your password?{' '}
                    <TextLink href={route('login')} className="auth-link">
                        Sign In
                    </TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
