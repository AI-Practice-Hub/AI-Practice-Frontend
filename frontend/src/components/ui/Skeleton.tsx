import React from 'react';

export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonChatItem() {
  return (
    <div className="w-full px-4 py-2 my-1">
      <Skeleton height="40px" className="rounded-lg" />
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex justify-start my-2">
      <div className="w-full bg-[#18181a] rounded-xl p-6 border border-[#232323]">
        <Skeleton height="20px" width="80%" className="mb-2" />
        <Skeleton height="20px" width="60%" />
      </div>
    </div>
  );
}
