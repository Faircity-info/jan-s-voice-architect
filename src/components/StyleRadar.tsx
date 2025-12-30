import { motion } from "framer-motion";
import { StyleDimensions } from "@/types/style";

interface StyleRadarProps {
  dimensions: StyleDimensions;
}

export function StyleRadar({ dimensions }: StyleRadarProps) {
  const labels = [
    { key: "directness", label: "Directness", angle: 0 },
    { key: "densityOfInsight", label: "Insight Density", angle: 51.4 },
    { key: "emotionality", label: "Emotionality", angle: 102.8 },
    { key: "authority", label: "Authority", angle: 154.2 },
    { key: "vulnerability", label: "Vulnerability", angle: 205.6 },
    { key: "practicality", label: "Practicality", angle: 257 },
    { key: "provocativeness", label: "Provocativeness", angle: 308.4 },
  ];

  const size = 280;
  const center = size / 2;
  const maxRadius = 100;

  const getPoint = (angle: number, value: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    const radius = (value / 10) * maxRadius;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const points = labels.map((item) => {
    const value = dimensions[item.key as keyof StyleDimensions];
    return getPoint(item.angle, value);
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ") + " Z";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="surface-elevated rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Style Dimensions</h3>
      
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circles */}
          {[2, 4, 6, 8, 10].map((ring) => (
            <circle
              key={ring}
              cx={center}
              cy={center}
              r={(ring / 10) * maxRadius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeOpacity={ring === 10 ? 0.5 : 0.2}
            />
          ))}

          {/* Axis lines */}
          {labels.map((item) => {
            const end = getPoint(item.angle, 10);
            return (
              <line
                key={item.key}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            );
          })}

          {/* Data polygon */}
          <motion.path
            d={pathData}
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
            />
          ))}

          {/* Labels */}
          {labels.map((item) => {
            const labelPoint = getPoint(item.angle, 12);
            const value = dimensions[item.key as keyof StyleDimensions];
            return (
              <g key={item.key}>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {item.label}
                </text>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-primary text-[11px] font-mono font-semibold"
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
