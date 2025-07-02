import { Tanque } from "./componentes/tanque";
import { Valvula } from "./componentes/valvula";
import { Tuberia } from "./componentes/tuberia";
import { GraficaLinea } from "./componentes/GraficaLinea";
import { DownloadButton } from "./componentes/DownloadButton";
import { useState, useEffect } from "react";
import { useMQTT } from "./hook/useMQTT";
import { useDataHistory } from "./hook/useDataHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow mx-auto max-w-5xl w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Sistema de Monitoreo</h1>
          <div className="flex items-center space-x-4">
            {/* Indicador de conexión */}
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <Badge variant={connected ? "default" : "destructive"}>
                {connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <DownloadButton historia={historia} filename="historial_sistema.json" />
          </div>
        </div>

        {/* Panel principal de tanques y válvulas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Control de Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tanque principal */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tanque Principal</h3>
                <div className="scale-75 origin-top">
                  <Tanque litros={tanquePrincipal.litros} capacidad={2000} />
                </div>
              </div>

              {/* Tanques secundarios */}
              <div className="flex flex-col">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Tanques Secundarios</h3>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Control de Válvulas</h3>
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
          </CardContent>
        </Card>

        {/* Flujo de tubería */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Flujo Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center">
                <Tuberia flujo={flujoPrincipal} direccion="horizontal" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficas de presión */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Historial de Presión</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Gráfica de flujo */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Flujo</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


