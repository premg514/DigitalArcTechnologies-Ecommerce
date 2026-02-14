'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash, Loader2, Search, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Pincode {
    _id: string;
    pincode: string;
    city: string;
    state: string;
    isActive: boolean;
}

export default function PincodeList() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [newPincode, setNewPincode] = useState({ pincode: '', city: '', state: '' });
    const [isDetecting, setIsDetecting] = useState(false);
    const queryClient = useQueryClient();

    const fetchPincodeDetails = async (pincode: string) => {
        if (pincode.length !== 6) return;

        try {
            setIsDetecting(true);
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                setNewPincode(prev => ({
                    ...prev,
                    city: postOffice.Block,
                    state: postOffice.State
                }));
                toast.success(`Detected: ${postOffice.Block}, ${postOffice.State}`);
            } else {
                toast.error('Invalid pincode or details not found');
            }
        } catch (error) {
            console.error('Pincode detection error:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setNewPincode(prev => ({ ...prev, pincode: val }));
        if (val.length === 6) {
            fetchPincodeDetails(val);
        }
    };

    const { data: pincodes, isLoading } = useQuery({
        queryKey: ['admin-pincodes'],
        queryFn: async () => {
            const { data } = await api.get('/pincodes/admin');
            return data.data as Pincode[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof newPincode) => {
            const { data: response } = await api.post('/pincodes', data);
            return response.data;
        },
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ['admin-pincodes'] });
            const previousPincodes = queryClient.getQueryData(['admin-pincodes']);
            queryClient.setQueryData(['admin-pincodes'], (old: Pincode[] | undefined) => [
                ...(old || []),
                { ...newData, _id: 'temp-id-' + Date.now(), isActive: true }
            ]);
            return { previousPincodes };
        },
        onError: (err: any, newData, context: any) => {
            queryClient.setQueryData(['admin-pincodes'], context.previousPincodes);
            const message = err.response?.data?.message || err.message || 'Failed to add pincode';
            toast.error(message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pincodes'] });
        },
        onSuccess: () => {
            toast.success('Pincode added successfully');
            setIsOpen(false);
            setNewPincode({ pincode: '', city: '', state: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/pincodes/${id}`);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['admin-pincodes'] });
            const previousPincodes = queryClient.getQueryData(['admin-pincodes']);
            queryClient.setQueryData(['admin-pincodes'], (old: Pincode[] | undefined) =>
                old?.filter(p => p._id !== id)
            );
            return { previousPincodes };
        },
        onError: (err: any, id, context: any) => {
            queryClient.setQueryData(['admin-pincodes'], context.previousPincodes);
            const message = err.response?.data?.message || err.message || 'Failed to remove pincode';
            toast.error(message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pincodes'] });
        },
        onSuccess: () => {
            toast.success('Pincode removed successfully');
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to remove this pincode?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPincode.pincode.length !== 6) {
            toast.error('Pincode must be 6 digits');
            return;
        }
        addMutation.mutate(newPincode);
    };

    const filteredPincodes = pincodes?.filter(p =>
        p.pincode.includes(search) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search pincodes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Pincode
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAdd}>
                            <DialogHeader>
                                <DialogTitle>Add Allowed Pincode</DialogTitle>
                                <DialogDescription>
                                    Add a new pincode where shipping is available.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Pincode (6 digits)</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="500001"
                                            maxLength={6}
                                            value={newPincode.pincode}
                                            onChange={handlePincodeChange}
                                            required
                                            className={isDetecting ? 'pr-10' : ''}
                                        />
                                        {isDetecting && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                            </div>
                                        )}
                                    </div>
                                    {isDetecting && (
                                        <p className="text-xs text-secondary animate-pulse">Detecting city and state...</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input
                                        placeholder="Hyderabad"
                                        value={newPincode.city}
                                        onChange={e => setNewPincode({ ...newPincode, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">State</label>
                                    <Input
                                        placeholder="Telangana"
                                        value={newPincode.state}
                                        onChange={e => setNewPincode({ ...newPincode, state: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addMutation.isPending}>
                                    {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Pincode
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pincode</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredPincodes?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    {search ? 'No pincodes match your search.' : 'No allowed pincodes found.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPincodes?.map((p) => (
                                <TableRow key={p._id}>
                                    <TableCell className="font-mono font-bold text-zinc-900">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-secondary" />
                                            {p.pincode}
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.city}</TableCell>
                                    <TableCell>{p.state}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(p._id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
