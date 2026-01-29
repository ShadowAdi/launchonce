"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  canGoNext?: boolean;
}

export function MultiStepForm({
  steps,
  currentStep,
  children,
  onNext,
  onPrev,
  onSubmit,
  isLoading = false,
  canGoNext = true,
}: MultiStepFormProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`relative flex-1 ${
                index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
              }`}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full ${
                      index < currentStep ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}

              {/* Step Circle */}
              <div className="group relative flex flex-col items-start">
                <span className="flex items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                      index < currentStep
                        ? "bg-primary"
                        : index === currentStep
                        ? "border-2 border-primary bg-white"
                        : "border-2 border-gray-300 bg-white"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          index === currentStep
                            ? "text-primary"
                            : "text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-2 flex min-w-0 flex-col">
                  <span
                    className={`text-sm font-medium ${
                      index <= currentStep ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isFirstStep || isLoading}
        >
          Previous
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
