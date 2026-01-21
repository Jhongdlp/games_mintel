"use client";

import WorldMap from "@/components/WorldMap";

export default function MapTestPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Gamified World Map</h1>
            <p className="text-slate-500">Test Page</p>
        </div>
        <WorldMap />
      </div>
    </div>
  );
}
