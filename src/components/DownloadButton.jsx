import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function DownloadButton({ historia, filename = "historial.json" }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatearSerie = (serie, tipo) =>
    serie?.map(item => ({
      timestamp: new Date(item.time).toISOString(),
      [tipo]: item.value,
      unidad: "kPa"
    })) || [];

  const formatearDatos = () => {
    const primeraValvula = historia.valvula1;

    return JSON.stringify({
      fechaGeneracion: new Date().toISOString(),
      version: "1.0",
      sistema: "Monitoreo de Tanques",
      datos: {
        valvula1: formatearSerie(historia.valvula1, 'presion'),
        valvula2: formatearSerie(historia.valvula2, 'presion'),
        valvula3: formatearSerie(historia.valvula3, 'presion')
      },
      estadisticas: {
        totalRegistros: Object.values(historia).reduce((total, serie) => total + (serie?.length || 0), 0),
        periodoInicio: primeraValvula?.[0] ? new Date(primeraValvula[0].time).toISOString() : null,
        periodoFin: primeraValvula?.[primeraValvula.length - 1] ? new Date(primeraValvula[primeraValvula.length - 1].time).toISOString() : null
      }
    }, null, 2);
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const datosJSON = formatearDatos();
      const blob = new Blob([datosJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="outline"
      size="sm"
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Descargando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Descargar Datos
        </>
      )}
    </Button>
  );
} 