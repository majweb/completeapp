import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo-icon-croped.png"
            alt="Logo Icon"
            {...props}
        />
    );
}
