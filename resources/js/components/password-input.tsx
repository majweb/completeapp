import { Eye, EyeOff, RefreshCcw } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function PasswordInput({
    className,
    ref,
    onGenerate,
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & {
    ref?: Ref<HTMLInputElement>;
    onGenerate?: (password: string) => void;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const generatePassword = () => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let retVal = '';

        for (let i = 0, n = charset.length; i < 12; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        if (onGenerate) {
            onGenerate(retVal);
            setShowPassword(true);
        }
    };

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', onGenerate ? 'pr-20' : 'pr-10', className)}
                ref={ref}
                {...props}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 gap-1">
                {onGenerate && (
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="flex items-center rounded-md px-2 py-1 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none transition-colors"
                        title="Generuj silne hasło"
                        tabIndex={-1}
                    >
                        <RefreshCcw className="size-4" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex items-center rounded-md px-2 py-1 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
