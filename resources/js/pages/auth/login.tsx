import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SplitSimpleAuthLayout from '@/layouts/auth/split-simple-auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <SplitSimpleAuthLayout title="Sign in" description="Enter your email and password.">
            <Head title="Sign In" />

            {status && (
                <div className="mb-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-center text-sm text-[#16A34A]">
                    {status}
                </div>
            )}

            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder="email@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm text-[#2563EB] hover:underline">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked === true)}
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-[#64748B]">
                        Remember me
                    </Label>
                </div>

                <Button type="submit" className="h-11 w-full rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                    Sign in
                </Button>

                <p className="pt-2 text-center text-sm text-[#64748B]">
                    No account?{' '}
                    <TextLink href={route('register')} className="text-[#2563EB]">
                        Create one
                    </TextLink>
                </p>
            </form>
        </SplitSimpleAuthLayout>
    );
}
