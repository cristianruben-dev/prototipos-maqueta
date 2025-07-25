import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DownloadButton({ historia, sessionStartTime, onLimpiarHistorial, filename = "historial.json" }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatearSerie = (serie, tipo) =>
    serie?.map(item => ({
      timestamp: new Date(item.time).toISOString(),
      [tipo]: typeof item.value === 'number' ? item.value.toFixed(2) : item.value, // Los datos ya vienen en PSI
      unidad: "PSI"
    })) || [];

  const formatearDatos = () => {
    const primeraValvula = historia.valvula1;

    return JSON.stringify({
      fechaGeneracion: new Date().toISOString(),
      version: "1.0",
      sistema: "Monitoreo de Tanques",
      sesion: {
        inicioSesion: sessionStartTime?.toISOString(),
        duracionSesion: sessionStartTime ? `${Math.round((Date.now() - sessionStartTime.getTime()) / 1000 / 60)} minutos` : null
      },
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

      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = filename.replace('.json', `_${timestamp}.json`);

      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
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

  const handleLimpiar = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
      onLimpiarHistorial();
    }
  };

  const formatearFechaInicio = () => {
    if (!sessionStartTime) return 'No disponible';
    return sessionStartTime.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalRegistros = () => {
    return Object.values(historia).reduce((total, serie) => total + (serie?.length || 0), 0);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Información de sesión */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Datos desde: {formatearFechaInicio()}</span>
        <Badge variant="outline" className="text-xs">
          {getTotalRegistros()} registros
        </Badge>
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading || getTotalRegistros() === 0}
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
              Descargar
            </>
          )}
        </Button>

        <Button
          onClick={handleLimpiar}
          disabled={getTotalRegistros() === 0}
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}