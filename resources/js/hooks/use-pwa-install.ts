import { useEffect, useState } from 'react';

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        console.log('PWA: usePwaInstall hook initialized');
        const handler = (e: any) => {
            console.log('PWA: beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        const appInstalledHandler = () => {
            console.log('PWA: App installed');
            setIsInstallable(false);
        };
        window.addEventListener('appinstalled', appInstalledHandler);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA: App is running in standalone mode');
            setIsInstallable(false);
        }

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
