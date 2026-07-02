import { AccountTypeBadge } from '@/components/accounting/account-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { AccountTreeNode } from '@/types/accounting';
import { Link } from '@inertiajs/react';
import { ChevronRight, Folder, Lock, Pencil, Square } from 'lucide-react';

interface AccountTreeNodeProps {
    node: AccountTreeNode;
    selectedId: number | null;
    onSelect: (id: number) => void;
    readOnly: boolean;
    depth?: number;
}

function AccountTreeRowContent({
    node,
    selectedId,
    onSelect,
    readOnly,
    depth,
    hasChildren,
}: AccountTreeNodeProps & { hasChildren: boolean }) {
    const isSelected = selectedId === node.id;

    return (
        <div
            className={cn(
                'hover:bg-muted/60 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                isSelected && 'bg-muted',
            )}
            style={{ paddingLeft: `${(depth ?? 0) * 12 + 8}px` }}
        >
            {hasChildren ? (
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                    </Button>
                </CollapsibleTrigger>
            ) : (
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                    <Square className="text-muted-foreground h-3 w-3" />
                </span>
            )}

            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => onSelect(node.id)}>
                {node.is_header ? (
                    <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
                ) : (
                    <span className="bg-primary/70 h-2 w-2 shrink-0 rounded-full" />
                )}
                <span className="font-mono text-xs">{node.account_code}</span>
                <span className="truncate">{node.account_name}</span>
            </button>

            <div className="flex shrink-0 items-center gap-1">
                {!node.is_active && <Badge variant="secondary">Inactive</Badge>}
                {node.is_system && <Lock className="text-muted-foreground h-3.5 w-3.5" />}
                <AccountTypeBadge type={node.account_type} />
                {!readOnly && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={route('accounting.accounts.edit', node.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export function AccountTreeNodeRow({ node, selectedId, onSelect, readOnly, depth = 0 }: AccountTreeNodeProps) {
    const hasChildren = node.children.length > 0;

    if (!hasChildren) {
        return (
            <AccountTreeRowContent
                node={node}
                selectedId={selectedId}
                onSelect={onSelect}
                readOnly={readOnly}
                depth={depth}
                hasChildren={false}
            />
        );
    }

    return (
        <Collapsible defaultOpen className="group">
            <AccountTreeRowContent
                node={node}
                selectedId={selectedId}
                onSelect={onSelect}
                readOnly={readOnly}
                depth={depth}
                hasChildren
            />
            <CollapsibleContent>
                {node.children.map((child) => (
                    <AccountTreeNodeRow
                        key={child.id}
                        node={child}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        readOnly={readOnly}
                        depth={depth + 1}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
