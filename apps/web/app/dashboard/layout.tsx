import { NuqsAdapter } from "nuqs/adapters/next/app"
import NextTopLoader from "nextjs-toploader"
import { NavigationWrapper } from "@/components/nav/navigation-wrapper"
import KBar from "@/components/nav/kbar"

// TODO: usar NuqsAdapter para manejar la autenticación y redirecciones en el layout, y no en cada página individualmente. Esto evitará que cada página tenga que lidiar con la lógica de autenticación por separado, y centralizará esa lógica en un solo lugar (el layout). Además, esto permitirá que el NuqsAdapter maneje automáticamente las redirecciones a la página de login cuando sea necesario, sin tener que agregar esa lógica en cada página individualmente.

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body>
      <KBar>
        <NuqsAdapter>
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          <NavigationWrapper>{children}</NavigationWrapper>
        </NuqsAdapter>
      </KBar>
    </body>
  )
}
