import AddFriendButton from '@/app/components/AddFriendButton'
import { FC } from 'react'

const page: FC = () => {
  return (
    <main className="max-w-lg mx-0 ml-8 p-8 pt-12 mt-16 sm:mt-0">
      <h1 className="text-4xl font-bold mb-6 text-left">Add a friend</h1>
      <div className="flex flex-col items-start space-y-4">
        <AddFriendButton />
      </div>
    </main>
  )
}


export default page