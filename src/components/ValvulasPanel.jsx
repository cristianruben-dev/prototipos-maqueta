import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ValvulasPanel = ({ nodes, onValvulaToggle, onValvulaHover, onValvulaLeave }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtrar solo las válvulas de los nodos
  const valvulas = nodes.filter(node => node.type === 'valvula');

  const getValvulaLabel = (valvula) => {
    if (valvula.id.includes('tanque-izq-1')) return 'Válvula Tanque Izq 1';
    if (valvula.id.includes('tanque-izq-2')) return 'Válvula Tanque Izq 2';
    if (valvula.id.includes('tanque-der-1')) return 'Válvula Tanque Der 1';
    if (valvula.id.includes('tanque-der-2')) return 'Válvula Tanque Der 2';
    if (valvula.data.id === 1) return 'Válvula Principal 1';
    if (valvula.data.id === 2) return 'Válvula Principal 2';
    return `Válvula ${valvula.data.id}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-[420px] z-30">
      <Card className="bg-neutral-50 border-t border-gray-300 rounded-none">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm flex items-center justify-between">
            Control de Válvulas
            <span className="text-xs">
              {isExpanded ? '▼' : '▲'}
            </span>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {valvulas.map((valvula) => (
                <div
                  key={valvula.id}
                  className="flex flex-col p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  onMouseEnter={() => onValvulaHover && onValvulaHover(valvula.id)}
                  onMouseLeave={() => onValvulaLeave && onValvulaLeave()}
                >
                  <div className="text-xs font-medium mb-2">
                    {getValvulaLabel(valvula)}
                  </div>

                  <div className='flex items-center justify-between w-full'>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full ${valvula.data.estado ? 'bg-green-500' : 'bg-red-500'
                          }`}
                      />
                      <span className={`text-xs ${valvula.data.estado ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {valvula.data.estado ? 'Abierta' : 'Cerrada'}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => onValvulaToggle && onValvulaToggle(valvula.data.id, !valvula.data.estado)}
                      className={`text-xs px-2 py-1 font-medium rounded transition-all duration-200 ${valvula.data.estado
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      {valvula.data.estado ? 'Cerrar' : 'Abrir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ValvulasPanel;