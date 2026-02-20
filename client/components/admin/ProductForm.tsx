'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash, X, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

const CATEGORIES = [
    'Rice',
    'Jaggery',
    'Nuts',
];

const productSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    price: z.coerce.number().min(0, 'Price must be positive'),
    compareAtPrice: z.coerce.number().min(0, 'Price must be positive').optional(),
    category: z.string().min(1, 'Category is required'),
    stock: z.coerce.number().min(0, 'Stock must be positive'),
    tagline: z.string().max(100, 'Tagline cannot exceed 100 characters').optional(),
    isActive: z.boolean().default(true),
    isCancellable: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>(
        initialData?.images || []
    );

    // Convert initial data to match form schema if editing
    const defaultValues: Partial<ProductFormValues> = initialData
        ? {
            ...initialData,
            price: Number(initialData.price),
            compareAtPrice: initialData.compareAtPrice ? Number(initialData.compareAtPrice) : undefined,
            stock: Number(initialData.stock),
        }
        : {
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: 'Rice',
            isActive: true,
            isCancellable: false,
        };

    const form = useForm<ProductFormValues>({
        // @ts-ignore - Conflict between Zod 4 and Hook Form Resolver 5
        resolver: zodResolver(productSchema) as any,
        defaultValues,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                toast.error(`${file.name} is not an image file`);
            }
            return isImage;
        });

        // Validate file sizes (5MB limit)
        const validSizedFiles = validFiles.filter(file => {
            const isValidSize = file.size <= 5 * 1024 * 1024;
            if (!isValidSize) {
                toast.error(`${file.name} is larger than 5MB`);
            }
            return isValidSize;
        });

        setSelectedFiles(prev => [...prev, ...validSizedFiles]);

        // Create previews
        validSizedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeSelectedImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true);

            // Create FormData for file upload
            const formData = new FormData();

            // Append all form fields
            Object.keys(data).forEach(key => {
                const value = data[key as keyof ProductFormValues];
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Append image files
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            // If editing, append existing images
            if (isEditing && existingImages.length > 0) {
                formData.append('existingImages', JSON.stringify(existingImages));
            }

            if (isEditing && initialData?._id) {
                await api.put(`/products/${initialData._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await api.post('/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            console.error('Error saving product:', error);
            // @ts-ignore
            const errorMessage = error.response?.data?.message || error.message || 'Error saving product. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Wireless Headphones" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tagline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Tagline (Brief Highlight)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Single Polished | Farm Fresh" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Appears on product cards and detail page
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Product description..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="compareAtPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Compare Price (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Original price before discount
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Inventory & Organization</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CATEGORIES.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col gap-4 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Active Status</FormLabel>
                                                    <FormDescription>
                                                        Product is visible in the shop
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isCancellable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Cancellable</FormLabel>
                                                    <FormDescription>
                                                        Customers can cancel order after purchase
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Images */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Product Images</h3>

                            {/* File Upload Input */}
                            <div className="mb-6">
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-zinc-500" />
                                        <p className="mb-2 text-sm text-zinc-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            PNG, JPG, GIF, WebP (MAX. 5MB)
                                        </p>
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {/* Existing Images (when editing) */}
                            {existingImages.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium mb-3">Existing Images</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative aspect-square w-full overflow-hidden rounded-md border">
                                                    <Image
                                                        src={getImageUrl(image.url)}
                                                        alt={image.alt || 'Product image'}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExistingImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-3">New Images</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative aspect-square w-full overflow-hidden rounded-md border">
                                                    <Image
                                                        src={preview}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeSelectedImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded truncate">
                                                    {selectedFiles[index]?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedFiles.length === 0 && existingImages.length === 0 && (
                                <p className="text-sm text-zinc-500 text-center py-4">
                                    No images selected. Please upload at least one image.
                                </p>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-white dark:bg-zinc-900 p-4 border-t shadow-lg z-10 rounded-lg">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || (selectedFiles.length === 0 && existingImages.length === 0)}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form >
        </Form >
    );
}
