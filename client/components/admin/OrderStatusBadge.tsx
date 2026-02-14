'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Clock,
    Package,
    Truck,
    XCircle
} from 'lucide-react';

interface OrderStatusBadgeProps {
    status: string;
    className?: string;
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    label: 'Pending',
                    className: 'bg-accent/20 text-accent font-semibold hover:bg-accent/30',
                    icon: Clock,
                };
            case 'processing':
                return {
                    label: 'Processing',
                    className: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-600/20',
                    icon: Package,
                };
            case 'shipped':
                return {
                    label: 'Shipped',
                    className: 'bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-600/20',
                    icon: Truck,
                };
            case 'delivered':
                return {
                    label: 'Delivered',
                    className: 'bg-green-600/10 text-green-600 dark:text-green-400 font-semibold hover:bg-green-600/20',
                    icon: CheckCircle2,
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    className: 'bg-primary/10 text-primary font-semibold hover:bg-primary/20',
                    icon: XCircle,
                };
            default:
                return {
                    label: status,
                    className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
                    icon: null,
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <Badge
            variant="secondary"
            className={cn('flex w-fit items-center gap-1.5 px-2.5 py-0.5', config.className, className)}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {config.label}
        </Badge>
    );
}
