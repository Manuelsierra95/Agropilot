import LandingPage from '@/components/landing'
import { getSession } from '@/lib/getSession'

export default async function Page() {
  const session = await getSession({ redirectToLogin: false, currentPath: '/' })

  return <LandingPage />
}
