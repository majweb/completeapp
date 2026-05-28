import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 16);
    }, [center, map]);

    return null;
}

interface LocationMapProps {
    lat: number | string;
    lng: number | string;
    onChange?: (lat: number, lng: number) => void;
    height?: string;
}

export function LocationMap({ lat, lng, onChange, height = '300px' }: LocationMapProps) {
    const position = useMemo((): [number, number] | null => {
        const nLat = typeof lat === 'string' ? parseFloat(lat) : lat;
        const nLng = typeof lng === 'string' ? parseFloat(lng) : lng;

        if (isNaN(nLat) || isNaN(nLng)) {
            return null;
        }

        return [nLat, nLng];
    }, [lat, lng]);

    if (!position) {
        return null;
    }

    return (
        <div style={{ height }} className="w-full rounded-md border overflow-hidden mt-4">
            <MapContainer center={position} zoom={16} className="h-full w-full" attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const pos = marker.getLatLng();
                            onChange?.(pos.lat, pos.lng);
                        },
                    }}
                />
                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
}
