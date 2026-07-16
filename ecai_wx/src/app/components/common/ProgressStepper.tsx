import React from 'react';

interface Step {
  label: string;
  sublabel?: string;
  done: boolean;
  active: boolean;
}

interface Props {
  steps: Step[];
}

export function ProgressStepper({ steps }: Props) {
  return (
    <div className="flex items-start justify-between relative">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all"
              style={{
                background: step.done ? '#3DBFA0' : step.active ? '#fff' : '#F3F4F6',
                borderColor: step.done || step.active ? '#3DBFA0' : '#E5E7EB',
                color: step.done ? '#fff' : step.active ? '#3DBFA0' : '#9CA3AF',
              }}
            >
              {step.done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div className="mt-1.5 text-center">
              <div
                className="text-xs font-medium"
                style={{ color: step.done || step.active ? '#1a1a2e' : '#9CA3AF' }}
              >
                {step.label}
              </div>
              {step.sublabel && (
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  {step.sublabel}
                </div>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className="h-0.5 flex-1 mt-4"
              style={{
                background: steps[i + 1].done || (step.done && steps[i + 1].active)
                  ? '#3DBFA0'
                  : '#E5E7EB',
                maxWidth: 60,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
