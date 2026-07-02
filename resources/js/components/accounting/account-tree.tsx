import { AccountTreeNodeRow } from '@/components/accounting/account-tree-node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountTreeNode } from '@/types/accounting';

interface AccountTreeProps {
    nodes: AccountTreeNode[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    readOnly: boolean;
}

export function AccountTree({ nodes, selectedId, onSelect, readOnly }: AccountTreeProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Account hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-18rem)] space-y-1 overflow-y-auto">
                {nodes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No accounts match the current filters.</p>
                ) : (
                    nodes.map((node) => (
                        <AccountTreeNodeRow
                            key={node.id}
                            node={node}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            readOnly={readOnly}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
