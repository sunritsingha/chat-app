"use client"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Loading = () => {
  return (
    <main className="pt-8 ml-12 pl-6">
      <Skeleton height={48} width={320} className="mb-8" />
      <div className="flex flex-col gap-4">
        <Skeleton height={56} width={400} className="rounded-md" />
        <Skeleton height={56} width={400} className="rounded-md" />
        <Skeleton height={56} width={400} className="rounded-md" />
      </div>
    </main>
  )
}

export default Loading