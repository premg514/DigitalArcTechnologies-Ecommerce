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
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Address;
}

export default function AddressForm({ onSuccess, onCancel, initialData }: AddressFormProps) {
    const { addAddress, updateAddress } = useAddress();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Address>({
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

    const zipCode = watch('zipCode');

    const fetchPincodeDetails = async (pincode: string) => {
        if (pincode.length !== 6) return;

        try {
            setIsDetecting(true);
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                setValue('city', postOffice.Block);
                setValue('state', postOffice.State);
                toast.success(`Detected: ${postOffice.Block}, ${postOffice.State}`);
            }
        } catch (error) {
            console.error('Pincode detection error:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    // Trigger detection when zipCode changes to 6 digits
    useState(() => {
        if (zipCode?.length === 6) {
            fetchPincodeDetails(zipCode);
        }
    });

    const onZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setValue('zipCode', val);
        if (val.length === 6) {
            fetchPincodeDetails(val);
        }
    };

    const onSubmit = async (data: Address) => {
        setIsSubmitting(true);
        try {
            // Check if pincode is allowed
            const { data: pincodeCheck } = await api.get(`/pincodes/check/${data.zipCode}`);

            if (!pincodeCheck.isAllowed) {
                toast.error(pincodeCheck.message || 'Shipping is not available for this pincode');
                setIsSubmitting(false);
                return;
            }

            if (initialData?._id) {
                await updateAddress.mutateAsync({ id: initialData._id, address: data });
            } else {
                await addAddress.mutateAsync(data);
            }
            onSuccess();
        } catch (error: any) {
            console.error('Failed to save address:', error);
            toast.error(error.response?.data?.message || 'Failed to save address');
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
                            placeholder="Door No, Street name, Area"
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
                            <div className="relative">
                                <Input
                                    id="zipCode"
                                    {...register('zipCode', {
                                        required: 'ZIP Code is required',
                                        onChange: onZipCodeChange
                                    })}
                                    placeholder="ZIP Code"
                                    maxLength={6}
                                    className={isDetecting ? 'pr-10' : ''}
                                />
                                {isDetecting && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    </div>
                                )}
                            </div>
                            {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                            {isDetecting && <p className="text-xs text-blue-600 animate-pulse">Detecting address details...</p>}
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
