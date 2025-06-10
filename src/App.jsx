import { Tanque } from "./componentes/tanque";
import { Valvula } from "./componentes/valvula";
import { Tuberia } from "./componentes/tuberia";
import { GraficaLinea } from "./componentes/GraficaLinea";
import { useState, useEffect } from "react";
import { useMQTT } from "./hook/useMQTT";
import { useDataHistory } from "./hook/useDataHistory";

export default function App() {
  const [tanquePrincipal, setTanquePrincipal] = useState({ litros: 0 });
  const [tanque1, setTanque1] = useState({ litros: 0 });
  const [tanque2, setTanque2] = useState({ litros: 0 });
  
  const [valvulas, setValvulas] = useState([
    { id: 1, presion: 0, estado: false },
    { id: 2, presion: 0, estado: false },
    { id: 3, presion: 0, estado: false }
  ]);
  
  const [flujoPrincipal, setFlujoPrincipal] = useState(0);
  const { historia, agregarDatos, getDatosGrafico } = useDataHistory(10); // 10 minutos de historial
  
  const { data, connected } = useMQTT("ws://localhost:9001", "tanques/datos");

  useEffect(() => {
    if (data && connected) {
      try {
        const datos = JSON.parse(data);
        console.log(datos);
        
        // Actualizar tanques
        if (datos.tanques) {
          setTanquePrincipal({ litros: datos.tanques.principal?.litros || 0 });
          setTanque1({ litros: datos.tanques.secundario1?.litros || 0 });
          setTanque2({ litros: datos.tanques.secundario2?.litros || 0 });
        }
        
        // Actualizar válvulas
        if (datos.valvulas) {
          const nuevasValvulas = [
            {
              id: 1,
              presion: datos.valvulas.valvula1?.presion || 0,
              estado: datos.valvulas.valvula1?.estado || false
            },
            {
              id: 2,
              presion: datos.valvulas.valvula2?.presion || 0,
              estado: datos.valvulas.valvula2?.estado || false
            },
            {
              id: 3,
              presion: datos.valvulas.valvula3?.presion || 0,
              estado: datos.valvulas.valvula3?.estado || false
            }
          ];
          
          setValvulas(nuevasValvulas);
          
          // Obtener el flujo principal
          const flujo = datos.flujos?.principal || 0;
          setFlujoPrincipal(flujo);
          
          // Actualizar el historial de presiones y flujo
          agregarDatos(nuevasValvulas, flujo);
        }
      } catch (error) {
        console.error("Error al procesar datos:", error);
      }
    }
  }, [data, connected]);

  const handleValvulaToggle = (id, estado) => {
    console.log(`Válvula ${id} ${estado ? 'abierta' : 'cerrada'}`);
    setValvulas(prevValvulas => 
      prevValvulas.map(v => 
        v.id === id ? { ...v, estado } : v
      )
    );
  };

  // Obtener datos formateados para las gráficas
  const datosGrafico = getDatosGrafico();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-grow mx-auto max-w-5xl w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-800">Sistema de Monitoreo</h2>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">{connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tanque principal */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tanque Principal</h3>
              <div className="scale-75 origin-top">
                <Tanque litros={tanquePrincipal.litros} capacidad={2000} />
              </div>
            </div>
            
            {/* Tanques secundarios */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">Tanques Secundarios</h3>
              <div className="flex justify-center gap-4">
                <div className="scale-75 origin-top">
                  <Tanque litros={tanque1.litros} capacidad={1000} />
                </div>
                <div className="scale-75 origin-top">
                  <Tanque litros={tanque2.litros} capacidad={1000} />
                </div>
              </div>
            </div>
            
            {/* Válvulas */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">Control de Válvulas</h3>
              <div className="grid gap-3">
                {valvulas.map((valvula) => (
                  <div key={valvula.id} className="flex flex-col items-center">
                    <Valvula 
                      id={valvula.id}
                      presion={valvula.presion}
                      estado={valvula.estado}
                      onToggle={handleValvulaToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Flujo de tubería */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-0 text-center">Flujo Principal</h3>
            <div className="flex items-center">
              <Tuberia flujo={flujoPrincipal} direccion="horizontal" />
            </div>
          </div>
        </div>
        
        {/* Gráficas de presión */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Historial de Presión</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GraficaLinea 
              datos={datosGrafico.valvula1} 
              titulo="Válvula 1" 
              color="#8884d8" 
              dataKey="presion"
              unidad="kPa"
              domainMin={70}
              domainMax={90}
              etiqueta="Presión"
            />
            <GraficaLinea 
              datos={datosGrafico.valvula2} 
              titulo="Válvula 2" 
              color="#82ca9d" 
              dataKey="presion"
              unidad="kPa"
              domainMin={70}
              domainMax={90}
              etiqueta="Presión"
            />
            <GraficaLinea 
              datos={datosGrafico.valvula3} 
              titulo="Válvula 3" 
              color="#ffc658" 
              dataKey="presion"
              unidad="kPa"
              domainMin={70}
              domainMax={90}
              etiqueta="Presión"
            />
          </div>
        </div>
        
        {/* Gráfica de flujo */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Historial de Flujo</h3>
          <div className="h-[200px]">
            <GraficaLinea 
              datos={datosGrafico.flujo} 
              titulo="Flujo Principal" 
              color="#3b82f6" 
              dataKey="flujo"
              unidad="L/s"
              domainMin={0}
              domainMax={10}
              etiqueta="Flujo"
            />
          </div>
        </div>
      </main>
      
    </div>
  );
}


