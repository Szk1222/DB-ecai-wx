import React from 'react';

interface Props {
  isRecording: boolean;
}

export function WaveAnimation({ isRecording }: Props) {
  const bars = [3, 6, 10, 14, 10, 18, 10, 14, 10, 6, 3];

  return (
    <div className="flex items-center justify-center gap-1" style={{ height: 40 }}>
      {bars.map((baseH, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 4,
            height: isRecording ? undefined : baseH,
            background: '#3DBFA0',
            animation: isRecording ? `wave ${0.8 + i * 0.08}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.06}s`,
            ...(isRecording
              ? {
                  minHeight: 4,
                  maxHeight: 36,
                }
              : {}),
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 36px; }
        }
      `}</style>
    </div>
  );
}
