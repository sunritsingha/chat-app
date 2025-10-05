"use client"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Loading = () => {
  return (
    <main className="max-w-lg mx-0 ml-8 p-8 pt-12">
      <div className="mb-6">
        <Skeleton height={40} width={220} className="mb-2" />
      </div>
      <div className="flex flex-col items-start space-y-4">
        <Skeleton height={48} width={180} className="rounded-md" />
        <Skeleton height={48} width={320} className="rounded-md" />
      </div>
    </main>
  )
}

export default Loading