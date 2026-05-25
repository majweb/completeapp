import { useEffect, useState } from 'react';

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(() => (typeof window !== 'undefined' ? (window as any).deferredPwaPrompt : null));
    const [isInstallable, setIsInstallable] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
            return false;
        }

        return !!(window as any).deferredPwaPrompt;
    });

    useEffect(() => {
        console.log('PWA: usePwaInstall hook initialized');

        const handler = (e: any) => {
            console.log('PWA: beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
            // Also update global
            (window as any).deferredPwaPrompt = e;
        };

        window.addEventListener('beforeinstallprompt', handler);

        const appInstalledHandler = () => {
            console.log('PWA: App installed');
            setIsInstallable(false);
        };

        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
        } else {
            console.log('User dismissed the PWA install prompt');
        }

        // We've used the prompt, and can't use it again, so clear it
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, install };
}
