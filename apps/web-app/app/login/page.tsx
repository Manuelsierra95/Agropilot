import LoginPage from '@/components/login'
import { getSession } from '@/lib/getSession'

export default async function Page() {
  const session = await getSession({
    redirectToLogin: false,
    currentPath: '/login',
  })

  return (
    <main className="bg-white">
      <LoginPage />
    </main>
  )
}
