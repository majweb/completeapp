import { Camera, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

import ImageCropDialog from '@/components/image-crop-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: File | null;
    onChange: (file: File | null) => void;
    imageUrl?: string | null;
    label?: string;
    description?: string;
    aspect?: number;
    circular?: boolean;
    className?: string;
    error?: string;
}

export default function ImageUpload({
    value,
    onChange,
    imageUrl,
    label,
    description,
    aspect = 1,
    circular = false,
    className,
    error,
}: ImageUploadProps) {
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string);
                setCropDialogOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedImage: Blob) => {
        const file = new File([croppedImage], 'image.jpg', { type: 'image/jpeg' });
        onChange(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        onChange(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const displayUrl = value ? URL.createObjectURL(value) : imageUrl;

    return (
        <div className={cn("space-y-3", className)}>
            {label && <Label>{label}</Label>}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group">
                    <div
                        className={cn(
                            "relative flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors",
                            circular ? "h-24 w-24 rounded-full" : "h-24 w-40 rounded-lg"
                        )}
                        onClick={triggerFileInput}
                    >
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt="Preview"
                                className={cn(
                                    "h-full w-full object-cover",
                                    circular ? "rounded-full" : "rounded-lg"
                                )}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-neutral-500">
                                <Camera className="h-6 w-6 mb-1" />
                                <span className="text-[10px] font-medium uppercase">Dodaj</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {(value || imageUrl) && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerFileInput}
                        >
                            {displayUrl ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
                        </Button>
                        {displayUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={removeImage}
                            >
                                Usuń
                            </Button>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                    {error && (
                        <p className="text-xs font-medium text-red-500">{error}</p>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/*"
                className="hidden"
            />

            <ImageCropDialog
                image={selectedImage}
                open={cropDialogOpen}
                onClose={() => setCropDialogOpen(false)}
                onCropComplete={onCropComplete}
                aspect={aspect}
            />
        </div>
    );
}
