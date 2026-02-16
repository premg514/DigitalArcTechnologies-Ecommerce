'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Address } from '@/types/user';

interface GuestAddressFormProps {
    onSubmit: (data: Address) => void;
    onBack: () => void;
}

export default function GuestAddressForm({ onSubmit, onBack }: GuestAddressFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<Address>({
        defaultValues: {
            street: '',
            city: '',
            state: '',
            country: 'India',
            zipCode: '',
            phone: '',
            fullName: '',
            isDefault: false,
        },
    });

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <p className="text-sm text-zinc-500">Please provide your delivery details</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                            id="fullName"
                            {...register('fullName', { required: 'Full name is required' })}
                            placeholder="Your Full Name"
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^(\+91|0)?[6-9]\d{9}$/,
                                    message: 'Invalid Indian phone number'
                                }
                            })}
                            placeholder="10-digit mobile number"
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="street">Address *</Label>
                        <Input
                            id="street"
                            {...register('street', { required: 'Address is required' })}
                            placeholder="House No, Street, Area"
                        />
                        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                {...register('city', { required: 'City is required' })}
                                placeholder="City"
                            />
                            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                {...register('state', { required: 'State is required' })}
                                placeholder="State"
                            />
                            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="zipCode">PIN Code *</Label>
                        <Input
                            id="zipCode"
                            {...register('zipCode', {
                                required: 'PIN code is required',
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: 'Invalid PIN code'
                                }
                            })}
                            placeholder="6-digit PIN code"
                            maxLength={6}
                        />
                        {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={onBack}>
                            Back
                        </Button>
                        <Button type="submit">
                            Continue to Payment
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
