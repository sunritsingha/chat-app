import { getServerSession } from 'next-auth'
import { FC } from 'react'
import { authOptions } from '../../lib/auth'

interface pageProps {
  
}

const page = async ({}) => {
    const session =  await getServerSession(authOptions)
  return <rect>Hello {session?.user?.name}</rect>
}

export default page