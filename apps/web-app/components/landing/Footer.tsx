export default function Footer() {
  return (
    <footer className="bg-green-900 text-white py-12 mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span>🌾</span> Agropilot
            </h3>
            <p className="text-green-100">
              La plataforma líder en gestión agrícola inteligente.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Producto</h4>
            <ul className="space-y-2 text-green-100">
              <li className="hover:text-white cursor-pointer transition-colors">
                Características
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Precios
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Demo
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Actualizaciones
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Recursos</h4>
            <ul className="space-y-2 text-green-100">
              <li className="hover:text-white cursor-pointer transition-colors">
                Documentación
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Blog
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Tutoriales
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Soporte
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Empresa</h4>
            <ul className="space-y-2 text-green-100">
              <li className="hover:text-white cursor-pointer transition-colors">
                Sobre Nosotros
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Contacto
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Privacidad
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Términos
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 pt-8 text-center text-green-100">
          <p>© 2025 Agropilot. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
