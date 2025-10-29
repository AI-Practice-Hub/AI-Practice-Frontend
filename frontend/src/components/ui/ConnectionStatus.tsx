import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff size={16} />
      <span>Connection lost. Reconnecting...</span>
    </div>
  );
}
