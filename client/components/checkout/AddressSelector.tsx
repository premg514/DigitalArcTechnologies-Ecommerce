'use client';

import { useState } from 'react';
import { Address } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check, MapPin, Trash2, Pencil } from 'lucide-react';
import AddressForm from './AddressForm';
import { useAddress } from '@/hooks/useAddress';

interface AddressSelectorProps {
    addresses: Address[];
    selectedAddress?: Address;
    onSelect: (address: Address) => void;
}

export default function AddressSelector({ addresses, selectedAddress, onSelect }: AddressSelectorProps) {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { deleteAddress } = useAddress();

    const handleAddressSaved = () => {
        setIsAddingNew(false);
        setEditingAddress(null);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this address?')) {
            await deleteAddress.mutateAsync(id);
        }
    };

    const handleEdit = (e: React.MouseEvent, address: Address) => {
        e.stopPropagation();
        setEditingAddress(address);
        setIsAddingNew(true);
    };

    if (isAddingNew) {
        return (
            <AddressForm
                onSuccess={handleAddressSaved}
                onCancel={() => {
                    setIsAddingNew(false);
                    setEditingAddress(null);
                }}
                initialData={editingAddress || undefined}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {addresses.map((address) => (
                    <Card
                        key={address._id}
                        className={`cursor-pointer transition-all border-2 relative ${selectedAddress?._id === address._id
                                ? 'border-primary bg-primary/5'
                                : 'border-transparent hover:border-gray-200'
                            }`}
                        onClick={() => onSelect(address)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">{address.city}, {address.state}</span>
                                        {address.isDefault && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {address.street}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {address.zipCode}, {address.country}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Phone: {address.phone}
                                    </p>
                                </div>
                                {selectedAddress?._id === address._id && (
                                    <div className="absolute top-4 right-4 text-primary">
                                        <Check className="h-5 w-5" />
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleEdit(e, address)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(e) => handleDelete(e, address._id!)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button
                    variant="outline"
                    className="h-auto min-h-[150px] flex flex-col gap-2 border-dashed"
                    onClick={() => setIsAddingNew(true)}
                >
                    <Plus className="h-8 w-8" />
                    <span>Add New Address</span>
                </Button>
            </div>
        </div>
    );
}
