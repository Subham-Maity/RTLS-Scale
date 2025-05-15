'use client';

import Link from 'next/link';

export default function Home() {
  return (
      <main className="min-h-screen bg-stone-950 text-stone-200 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">Delivery App</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <Link href="/user" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-medium text-center">
            Enter as User
          </Link>

          <Link href="/driver" className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-medium text-center">
            Enter as Driver
          </Link>
        </div>

        <p className="mt-8 text-stone-400 max-w-md text-center">
          Choose your role to continue. Users can track drivers, while drivers share their location.
        </p>
      </main>
  );
}