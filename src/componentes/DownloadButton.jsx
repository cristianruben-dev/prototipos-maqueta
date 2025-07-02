import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function DownloadButton({ historia, filename = "historial.json" }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatearDatos = () => {
    const datosFormateados = {
      fechaGeneracion: new Date().toISOString(),
      version: "1.0",
      sistema: "Monitoreo de Tanques",
      datos: {
        valvula1: historia.valvula1?.map(item => ({
          timestamp: new Date(item.time).toISOString(),
          presion: item.value,
          unidad: "kPa"
        })) || [],
        valvula2: historia.valvula2?.map(item => ({
          timestamp: new Date(item.time).toISOString(),
          presion: item.value,
          unidad: "kPa"
        })) || [],
        valvula3: historia.valvula3?.map(item => ({
          timestamp: new Date(item.time).toISOString(),
          presion: item.value,
          unidad: "kPa"
        })) || [],
        flujo: historia.flujo?.map(item => ({
          timestamp: new Date(item.time).toISOString(),
          flujo: item.value,
          unidad: "L/s"
        })) || []
      },
      estadisticas: {
        totalRegistros: (historia.valvula1?.length || 0) + (historia.valvula2?.length || 0) + (historia.valvula3?.length || 0) + (historia.flujo?.length || 0),
        periodoInicio: historia.valvula1?.[0] ? new Date(historia.valvula1[0].time).toISOString() : null,
        periodoFin: historia.valvula1?.[historia.valvula1.length - 1] ? new Date(historia.valvula1[historia.valvula1.length - 1].time).toISOString() : null
      }
    };

    return JSON.stringify(datosFormateados, null, 2);
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Simular un pequeño delay para mostrar el loading
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