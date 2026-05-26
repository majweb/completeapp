import { LucideMic, LucideMicOff } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
    onResult: (text: string) => void;
    className?: string;
    iconClassName?: string;
    disabled?: boolean;
}

export function VoiceInput({ onResult, className, iconClassName, disabled }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);

    const startListening = useCallback(() => {
        if (disabled) {
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Twoja przeglądarka nie obsługuje rozpoznawania mowy.');

            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pl-PL';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            onResult(text);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [onResult]);

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={startListening}
            disabled={disabled}
            className={cn(
                "h-7 w-7 cursor-pointer transition-colors hover:bg-transparent",
                isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary",
                className
            )}
            title="Użyj mikrofonu (mowa na tekst)"
        >
            {isListening ? <LucideMicOff className={cn("h-4 w-4", iconClassName)} /> : <LucideMic className={cn("h-4 w-4", iconClassName)} />}
        </Button>
    );
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
