export function Tanque({porcentaje, capacidad}){
    return(
        <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xl font-semibold">Nivel del tanque: {porcentaje}%</h3>
            <h3 className="mb-1 text-sm font-semibold">Capacidad del tanque: {capacidad} l</h3>
            {/* Contenedor del tanque con borde y efecto 3D */}
            <div className="relative w-[100px] h-[150px] border-4 border-gray-400 rounded-lg overflow-hidden shadow-lg">
                {/* Líquido del tanque con efecto de gradiente */}
                <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                    style={{
                        height: `${porcentaje}%`,
                    }}
                />
            </div>
        </div>
    )
}