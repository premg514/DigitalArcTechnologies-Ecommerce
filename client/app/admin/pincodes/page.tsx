'use client';

import PincodeList from '@/components/admin/PincodeList';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function PincodesPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Shipping Restrictions</h2>
                        <p className="text-sm text-zinc-500">
                            Manage allowed pincodes for product delivery.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <PincodeList />
            </Card>
        </div>
    );
}
