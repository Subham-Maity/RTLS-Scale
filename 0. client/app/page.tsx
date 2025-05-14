'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoveIcon, UsersIcon } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/map-component'), { ssr: false });

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [locations, setLocations] = useState<Record<string, LocationData>>({});

  useEffect(() => {
    const socketInstance = io("http://localhost:3335");
    console.log("Socket connected:", socketInstance.connected);

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Sending location: ${latitude}, ${longitude}`);
          socketInstance.emit("send-location", { latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    socketInstance.on("receive-location", (data: LocationData) => {
      console.log("Received location:", data);
      setLocations((prev) => ({
        ...prev,
        [data.id]: data,
      }));
    });

    socketInstance.on("user-disconnected", (id: string) => {
      setLocations((prev) => {
        const newLocations = { ...prev };
        delete newLocations[id];
        return newLocations;
      });
    });

    socketInstance.on("active-users", (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 p-4 md:p-6">
      <Card className="mb-4 bg-stone-900 border-stone-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-stone-400">
              <MoveIcon className="h-5 w-5 text-stone-400" />
              Real-time Device Tracker
            </div>
            <Badge variant="outline" className="bg-stone-800 text-stone-300">
              <UsersIcon className="h-3 w-3 mr-1" />
              {activeUsers} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[70vh] rounded-md overflow-hidden">
            <MapComponent locations={locations} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}