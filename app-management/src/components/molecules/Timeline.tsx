'use client';

import React from 'react';

import { Icon } from '@/components/atoms/Icon';

export interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  isCompleted: boolean;
}

export interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={index} className="relative flex gap-6">
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center">
              <div
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  step.isCompleted
                    ? 'border-accent bg-accent text-bg'
                    : 'border-muted/30 bg-surface'
                }`}
              >
                {step.isCompleted && <Icon name="CheckCircle" size={12} />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 ${step.isCompleted ? 'bg-accent' : 'bg-muted/20'}`} />
              )}
            </div>

            {/* Step Content */}
            <div className="pb-8 pt-0.5">
              <h4
                className={`text-sm font-semibold ${step.isCompleted ? 'text-text' : 'text-muted'}`}
              >
                {step.title}
              </h4>
              {step.description && <p className="mt-1 text-sm text-muted">{step.description}</p>}
              {step.timestamp && <p className="mt-1 text-xs text-muted/70">{step.timestamp}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
