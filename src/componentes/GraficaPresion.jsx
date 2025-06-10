import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficaPresion({ datos, titulo, color = "#8884d8" }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="bg-white p-3 rounded-md border border-gray-200 h-[150px] flex items-center justify-center">
        <p className="text-sm text-gray-400">No hay datos suficientes</p>
      </div>
    );
  }

  // Crear un ID único para el gradiente
  const gradienteId = `color${titulo.replace(/\s+/g, '')}`;

  return (
    <div className="bg-white p-3 rounded-md border border-gray-200">
      <h4 className="text-xs font-medium text-gray-700 mb-2">{titulo}</h4>
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={datos}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 9 }} 
              interval="preserveStartEnd"
              tickCount={3}
            />
            <YAxis 
              domain={[70, 90]} 
              tick={{ fontSize: 9 }} 
              tickCount={3}
            />
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <Tooltip 
              contentStyle={{ fontSize: '10px', padding: '2px 5px' }}
              labelStyle={{ fontSize: '10px' }}
              itemStyle={{ fontSize: '10px', padding: 0, margin: 0 }}
              formatter={(value) => [`${value} kPa`, 'Presión']}
            />
            <Area 
              type="monotone" 
              dataKey="presion" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#${gradienteId})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 