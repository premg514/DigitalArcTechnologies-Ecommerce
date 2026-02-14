'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Address } from '@/types/user';
import { useAddress } from '@/hooks/useAddress';

interface AddressFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Address;
}

export default function AddressForm({ onSuccess, onCancel, initialData }: AddressFormProps) {
    const { addAddress, updateAddress } = useAddress();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<Address>({
        defaultValues: initialData || {
            street: '',
            city: '',
            state: '',
            country: 'India',
            zipCode: '',
            phone: '',
            isDefault: false,
        },
    });

    const onSubmit = async (data: Address) => {
        setIsSubmitting(true);
        try {
            if (initialData?._id) {
                await updateAddress.mutateAsync({ id: initialData._id, address: data });
            } else {
                await addAddress.mutateAsync(data);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save address:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{initialData ? 'Edit Address' : 'Add New Address'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            {...register('street', { required: 'Street address is required' })}
                            placeholder="123 Main St"
                        />
                        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                {...register('city', { required: 'City is required' })}
                                placeholder="City"
                            />
                            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                {...register('state', { required: 'State is required' })}
                                placeholder="State"
                            />
                            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                {...register('country', { required: 'Country is required' })}
                                placeholder="Country"
                            />
                            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                                id="zipCode"
                                {...register('zipCode', { required: 'ZIP Code is required' })}
                                placeholder="ZIP Code"
                            />
                            {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            {...register('phone', { required: 'Phone number is required' })}
                            placeholder="Phone Number"
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isDefault"
                            {...register('isDefault')}
                        />
                        <Label htmlFor="isDefault">Set as default address</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Address'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
