import { Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    title = 'No Results Found',
    description = 'Try adjusting your search or filters',
    icon = <Search className="h-12 w-12 text-muted-foreground" />,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">{description}</p>
            {action && (
                <button onClick={action.onClick} className="btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
}
