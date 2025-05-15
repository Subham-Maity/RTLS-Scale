'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TruckIcon, MoveIcon } from 'lucide-react';
import Link from 'next/link';

const MapComponent = dynamic(() => import('@/components/map-component'), { ssr: false });

interface LocationData {
    id: string;
    latitude: number;
    longitude: number;
}

export default function DriverPage() {
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
    const [driverLocation, setDriverLocation] = useState<LocationData | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(false);

    useEffect(() => {
        const socket = io("http://localhost:3335");
        setSocketInstance(socket);
        console.log("Driver socket connected:", socket.connected);

        return () => {
            socket.disconnect();
        };
    }, []);

    // Start sharing location
    const startSharing = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsOnline(true);

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const data = {
                    id: socketInstance?.id || 'current-driver',
                    latitude,
                    longitude
                };

                setDriverLocation(data);
                console.log(`Sending driver location: ${latitude}, ${longitude}`);

                if (socketInstance) {
                    socketInstance.emit("send-location", { latitude, longitude });
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert(`Error getting location: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        // Clean up
        return () => navigator.geolocation.clearWatch(watchId);
    };

    // Stop sharing location
    const stopSharing = () => {
        setIsOnline(false);
        setDriverLocation(null);
    };

    // Get driver's location for the map
    const getDriverLocation = (): Record<string, LocationData> => {
        if (!driverLocation || !socketInstance) return {};

        return {
            [socketInstance.id || 'current-driver']: driverLocation
        };
    };

    return (
        <main className="min-h-screen bg-stone-950 text-stone-200 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Driver View</h1>
                    <Link href="/" className="text-stone-400 hover:text-stone-200">
                        Back to Home
                    </Link>
                </div>

                <Card className="bg-stone-900 border-stone-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-stone-400">
                                <TruckIcon className="h-5 w-5 text-stone-400" />
                                Location Sharing
                            </div>
                            <Badge variant="outline" className="bg-stone-800 text-stone-300">
                                <MoveIcon className="h-3 w-3 mr-1" />
                                {isOnline ? 'Sharing Location' : 'Offline'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            {!isOnline ? (
                                <button
                                    onClick={startSharing}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium w-full"
                                >
                                    Start Sharing Location
                                </button>
                            ) : (
                                <>
                                    <p className="text-sm mb-1">Your driver ID (share with customers):</p>
                                    <code className="bg-stone-800 px-2 py-1 rounded text-sm block mb-3">
                                        {socketInstance?.id || "Connecting..."}
                                    </code>
                                    <button
                                        onClick={stopSharing}
                                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium w-full"
                                    >
                                        Stop Sharing Location
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="h-[60vh] rounded-md overflow-hidden border border-stone-800">
                            <MapComponent locations={getDriverLocation()} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}