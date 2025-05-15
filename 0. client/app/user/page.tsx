'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';

const MapComponent = dynamic(() => import('@/components/map-component'), { ssr: false });

interface LocationData {
    id: string;
    latitude: number;
    longitude: number;
}

export default function UserPage() {
    const [activeUsers, setActiveUsers] = useState<number>(0);
    const [locations, setLocations] = useState<Record<string, LocationData>>({});
    const [trackingDriverId, setTrackingDriverId] = useState<string>('');
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io("http://localhost:3335");
        setSocketInstance(socket);
        console.log("Socket connected:", socket.connected);

        socket.on("receive-location", (data: LocationData) => {
            console.log("Received location:", data);
            setLocations((prev) => ({
                ...prev,
                [data.id]: data,
            }));
        });

        socket.on("user-disconnected", (id: string) => {
            setLocations((prev) => {
                const newLocations = { ...prev };
                delete newLocations[id];
                return newLocations;
            });
        });

        socket.on("active-users", (count: number) => {
            setActiveUsers(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Track specific driver
    const handleTrackDriver = () => {
        if (socketInstance && trackingDriverId) {
            socketInstance.emit("track-driver", trackingDriverId);
        }
    };

    // Get filtered locations (only show tracked driver if one is specified)
    const getTrackedLocations = (): Record<string, LocationData> => {
        if (!trackingDriverId) return locations;

        const filteredLocations: Record<string, LocationData> = {};
        if (locations[trackingDriverId]) {
            filteredLocations[trackingDriverId] = locations[trackingDriverId];
        }
        return filteredLocations;
    };

    return (
        <main className="min-h-screen bg-stone-950 text-stone-200 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">User View</h1>
                    <Link href="/" className="text-stone-400 hover:text-stone-200">
                        Back to Home
                    </Link>
                </div>

                <Card className="bg-stone-900 border-stone-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-stone-400">
                                <MapIcon className="h-5 w-5 text-stone-400" />
                                Track Drivers
                            </div>
                            <Badge variant="outline" className="bg-stone-800 text-stone-300">
                                <UsersIcon className="h-3 w-3 mr-1" />
                                {activeUsers} Active
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p className="text-sm mb-2">Track driver by ID:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={trackingDriverId}
                                    onChange={(e) => setTrackingDriverId(e.target.value)}
                                    placeholder="Enter driver ID"
                                    className="flex-1 bg-stone-800 border border-stone-700 rounded px-3 py-2 text-sm"
                                />
                                <button
                                    onClick={handleTrackDriver}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                                >
                                    Track
                                </button>
                            </div>
                        </div>

                        <div className="h-[60vh] rounded-md overflow-hidden border border-stone-800">
                            <MapComponent locations={getTrackedLocations()} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}