import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Naprawa ikon Leaflet w środowisku React/Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Users } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapJob {
    id: number;
    status: string;
    status_label: string;
    client_name: string;
    address: string;
    latitude: number;
    longitude: number;
    scheduled_at?: string;
    technician_name?: string;
}

interface JobMapProps {
    jobs: MapJob[];
    height?: string;
    center?: [number, number];
    zoom?: number;
    showRoute?: boolean;
}

function SetBounds({ jobs }: { jobs: MapJob[] }) {
    const map = useMap();

    useEffect(() => {
        if (jobs.length > 0) {
            const bounds = L.latLngBounds(jobs.map(job => [job.latitude, job.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [jobs, map]);

    return null;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return '#3b82f6'; // blue-500
        case 'in_progress': return '#eab308'; // yellow-500
        case 'completed': return '#22c55e'; // green-500
        case 'approved': return '#64748b'; // slate-500
        default: return '#64748b'; // slate-500
    }
};

const createCustomIcon = (status: string, index?: number) => {
    const color = getStatusColor(status);
    const iconHTML = renderToStaticMarkup(
        <div style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={color} stroke="white" strokeWidth="2"/>
                {index !== undefined ? (
                    <text x="12" y="12" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">{index + 1}</text>
                ) : (
                    <circle cx="12" cy="10" r="3" fill="white"/>
                )}
            </svg>
        </div>
    );

    return new L.DivIcon({
        className: 'custom-div-icon',
        html: iconHTML,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

export default function JobMap({ jobs, height = "400px", center, zoom = 10, showRoute = false }: JobMapProps) {
    const isClient = typeof window !== 'undefined';

    const defaultCenter: [number, number] = useMemo(() => {
        if (center) {
            return center;
        }

        if (jobs.length > 0) {
            return [jobs[0].latitude, jobs[0].longitude];
        }

        return [52.2297, 21.0122]; // Warszawa jako fallback
    }, [center, jobs]);

    const routePositions = useMemo(() => {
        return jobs.map(job => [job.latitude, job.longitude] as [number, number]);
    }, [jobs]);

    if (!isClient) {
        return <div style={{ height, width: '100%', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />;
    }

    return (
        <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapContainer center={defaultCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SetBounds jobs={jobs} />
                {showRoute && jobs.length > 1 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                    />
                )}
                {jobs.map((job, index) => (
                    <Marker
                        key={job.id}
                        position={[job.latitude, job.longitude]}
                        icon={createCustomIcon(job.status, showRoute ? index : undefined)}
                    >
                        <Popup>
                            <div className="p-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h3 className="font-bold text-sm">{job.client_name}</h3>
                                    {job.scheduled_at && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1 font-mono">
                                            {job.scheduled_at}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{job.address}</p>
                                {job.technician_name && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{job.technician_name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getStatusColor(job.status) }}
                                    ></span>
                                    <span className="text-xs font-medium">{job.status_label}</span>
                                </div>
                                <a
                                    href={`/jobs/${job.id}`}
                                    className="text-xs text-primary hover:underline mt-2 block"
                                >
                                    Zobacz szczegóły
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
