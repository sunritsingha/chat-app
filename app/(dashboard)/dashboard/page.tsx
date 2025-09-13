import { getServerSession } from 'next-auth'
import { FC } from 'react'
import { authOptions } from '../../lib/auth'

interface pageProps {
  
}

const page = async ({}) => {
    const session =  await getServerSession(authOptions)
  return <div>Hello {session?.user?.name}</div>
}

export default page