import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Account } from '@/types/accounting';
import { router } from '@inertiajs/react';

interface AccountDeactivateDialogProps {
    account: Account;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AccountDeactivateDialog({ account, open, onOpenChange }: AccountDeactivateDialogProps) {
    const confirm = () => {
        router.patch(
            route('accounting.accounts.deactivate', account.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deactivate account</DialogTitle>
                    <DialogDescription>
                        Deactivate <strong>{account.account_code}</strong> — {account.account_name}? Historical journal
                        entries will remain valid. You can reactivate this account later.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirm}>
                        Deactivate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
