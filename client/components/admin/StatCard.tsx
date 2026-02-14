'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn('p-6 border-border', className)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-3xl font-heading font-bold text-foreground mt-2">
                        {value}
                    </p>
                    {trend && (
                        <p
                            className={cn(
                                'text-sm mt-2 flex items-center gap-1',
                                trend.isPositive
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-primary'
                            )}
                        >
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-muted-foreground">vs last month</span>
                        </p>
                    )}
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </Card>
    );
}

