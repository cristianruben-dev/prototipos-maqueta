export function Header(){
    return(
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h1 className="text-2xl font-bold">Sistema de Monitoreo</h1>
                    </div>
                    <nav>
                        <ul className="flex space-x-6">
                            <li><a href="#" className="hover:text-blue-200 transition-colors">Inicio</a></li>
                            <li><a href="#" className="hover:text-blue-200 transition-colors">Dashboard</a></li>
                            <li><a href="#" className="hover:text-blue-200 transition-colors">Configuración</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    )
}