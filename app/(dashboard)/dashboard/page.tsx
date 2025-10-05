import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

const Page = async () => {
    const session =  await getServerSession(authOptions)
  return <div>Hello {session?.user?.name}</div>
}

export default Page