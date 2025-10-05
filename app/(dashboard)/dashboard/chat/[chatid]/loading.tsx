"use client"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* Header skeleton */}
      <div className="flex items-center justify-between py-3 border-b-2 border-gray-200 px-4">
        <div className="flex items-center space-x-4">
          <Skeleton circle height={48} width={48} />
          <div className="flex flex-col">
            <Skeleton height={20} width={120} />
            <Skeleton height={14} width={180} />
          </div>
        </div>
      </div>
      {/* Messages skeleton */}
      <div className="flex-1 flex flex-col-reverse gap-4 p-3 overflow-y-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div>
              <Skeleton
                width={180 + Math.random() * 80}
                height={32}
                borderRadius={16}
                className="mb-2"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Chat input skeleton */}
      <div className="border-t border-gray-200 px-4 pt-4 mb-2">
        <Skeleton height={40} width="100%" borderRadius={8} />
      </div>
    </div>
  )
}
