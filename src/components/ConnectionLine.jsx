export default function ConnectionLine({ fromX, fromY, toX, toY }) {
  const controlX = fromX + (toX - fromX) * 0.6;
  const controlY = fromY;

  return (
    <g>
      <path
        fill="none"
        stroke='#3b82f6'
        strokeWidth={4}
        strokeDasharray="8,4"
        className="connection-line"
        d={`M${fromX},${fromY} Q ${controlX} ${controlY} ${toX},${toY}`}
        style={{
          filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))'
        }}
      />
    </g>
  );
} 