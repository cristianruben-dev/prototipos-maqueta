import { useState } from 'react';

export function DownloadButton({ historia, filename = 'datos_sistema.json' }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    try {
      setIsDownloading(true);
      
      // Crear una copia de los datos para mantener el original intacto
      const datosParaDescargar = { ...historia };
      
      // Añadir metadata
      datosParaDescargar.metadata = {
        fecha_descarga: new Date().toISOString(),
        total_puntos: {
          valvula1: historia.valvula1.length,
          valvula2: historia.valvula2.length,
          valvula3: historia.valvula3.length,
          flujo: historia.flujo.length
        }
      };
      
      // Convertir a JSON string con formato bonito (indentación de 2 espacios)
      const jsonString = JSON.stringify(datosParaDescargar, null, 2);
      
      // Crear un Blob con los datos
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Crear URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear un elemento de anchor para la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // Simular un click en el anchor para iniciar la descarga
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    } catch (error) {
      console.error('Error al descargar datos:', error);
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className={`
        px-4 py-2 rounded-md text-white text-sm font-medium 
        ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
        transition-colors flex items-center justify-center
      `}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Descargando...
        </>
      ) : (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar Datos
        </>
      )}
    </button>
  );
} 