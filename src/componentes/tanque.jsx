export function Tanque({ litros, capacidad = 1000 }) {
    // Calcular el porcentaje para el llenado visual
    const porcentaje = Math.min(100, (litros / capacidad) * 100);
    
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center mb-1">
                <span className="text-lg font-medium text-blue-600">{litros.toFixed(0)}</span>
                <span className="ml-1 text-xs text-gray-500">/ {capacidad}L</span>
            </div>
            
            {/* Contenedor del tanque minimalista */}
            <div className="relative w-[120px] h-[180px] border-2 border-gray-300 rounded-md overflow-hidden">
                {/* Líquido del tanque */}
                <div 
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
                    style={{
                        height: `${porcentaje}%`,
                        opacity: 0.8
                    }}
                />
                
                {/* Líneas de medición simplificadas */}
                <div className="absolute w-full h-full flex flex-col justify-between py-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className="border-b border-gray-300 w-2 ml-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}