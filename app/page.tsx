'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GaussianComponent, GaussianMixtureModel, GMMState, GMMHistoryStep } from '@/lib/gmm';
import { generateSimpleSampleData } from '@/lib/csvParser';
import GMMChart from '@/components/GMMChart';
import FileUpload from '@/components/FileUpload';
import EMControls from '@/components/EMControls';
import ParameterPanel from '@/components/ParameterPanel';
import MathFormulasPanel from '@/components/MathFormulasPanel';

export default function Home() {
  const [data, setData] = useState<number[]>([]);
  const [components, setComponents] = useState<GaussianComponent[]>([]);
  const [gmmHistory, setGmmHistory] = useState<GMMHistoryStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [converged, setConverged] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    probabilities: {
      total: number;
      componentProbs: number[];
      posteriors: number[];
    };
  } | null>(null);

  const initializeGMM = useCallback((newData: number[], numComponents: number = 2) => {
    if (newData.length === 0) return;
    
    const gmm = new GaussianMixtureModel(newData, numComponents);
    const initialComponents = gmm.initializeComponents();
    const initialLogLikelihood = gmm.calculateLogLikelihood(initialComponents);
    
    setComponents(initialComponents);
    setGmmHistory([{
      components: JSON.parse(JSON.stringify(initialComponents)),
      iteration: 0,
      logLikelihood: initialLogLikelihood
    }]);
    setCurrentStep(0);
    setConverged(false);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const sampleData = generateSimpleSampleData(100);
    setData(sampleData);
    initializeGMM(sampleData, 2);
  }, [initializeGMM]);

  const handleDataLoad = (newData: number[]) => {
    setData(newData);
    initializeGMM(newData, components.length);
  };

  const handleComponentCountChange = (newCount: number) => {
    initializeGMM(data, newCount);
  };

  const handleComponentDrag = (index: number, newMu: number, newPi: number) => {
    const newComponents = [...components];
    newComponents[index] = {
      ...newComponents[index],
      mu: newMu,
      pi: Math.max(0.01, Math.min(0.99, newPi))
    };
    
    const totalPi = newComponents.reduce((sum, comp) => sum + comp.pi, 0);
    newComponents.forEach(comp => comp.pi /= totalPi);
    
    setComponents(newComponents);
    
    if (gmmHistory.length > 0) {
      const newHistory = [...gmmHistory];
      newHistory[currentStep] = {
        ...newHistory[currentStep],
        components: JSON.parse(JSON.stringify(newComponents))
      };
      setGmmHistory(newHistory);
    }
  };

  const handleStepForward = () => {
    if (currentStep >= gmmHistory.length - 1 && !converged) {
      const gmm = new GaussianMixtureModel(data, components.length);
      const result = gmm.singleEMStep(components);
      
      
      const newStep: GMMHistoryStep = {
        components: JSON.parse(JSON.stringify(result.components)),
        iteration: currentStep + 1,
        logLikelihood: result.logLikelihood,
        responsibilities: result.responsibilities
      };
      
      const newHistory = [...gmmHistory, newStep];
      setGmmHistory(newHistory);
      setComponents(result.components);
      setCurrentStep(currentStep + 1);
      
      if (gmmHistory.length > 0) {
        const prevLogLikelihood = gmmHistory[gmmHistory.length - 1].logLikelihood;
        if (Math.abs(result.logLikelihood - prevLogLikelihood) < 1e-6) {
          setConverged(true);
        }
      }
    } else if (currentStep < gmmHistory.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setComponents(JSON.parse(JSON.stringify(gmmHistory[nextStep].components)));
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setComponents(JSON.parse(JSON.stringify(gmmHistory[prevStep].components)));
    }
  };

  const handleReset = () => {
    initializeGMM(data, components.length);
  };

  const handleRunToConvergence = async () => {
    setIsRunning(true);
    setConverged(false);
    
    const gmm = new GaussianMixtureModel(data, components.length);
    let currentComponents = JSON.parse(JSON.stringify(components));
    let iteration = currentStep;
    let prevLogLikelihood = gmmHistory[currentStep]?.logLikelihood ?? -Infinity;
    
    const runStep = () => {
      if (iteration >= 200) {
        setIsRunning(false);
        setConverged(true);
        return;
      }
      
      const result = gmm.singleEMStep(currentComponents);
      currentComponents = result.components;
      iteration++;
      
      const newStep: GMMHistoryStep = {
        components: JSON.parse(JSON.stringify(currentComponents)),
        iteration,
        logLikelihood: result.logLikelihood,
        responsibilities: result.responsibilities
      };
      
      setGmmHistory(prev => [...prev, newStep]);
      setComponents(currentComponents);
      setCurrentStep(iteration);
      
      const likelihoodChange = Math.abs(result.logLikelihood - prevLogLikelihood);
      
      if (likelihoodChange < 1e-6) {
        setIsRunning(false);
        setConverged(true);
        return;
      }
      
      prevLogLikelihood = result.logLikelihood;
      
      setTimeout(runStep, 200);
    };
    
    setTimeout(runStep, 200);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleHover = (x: number, probabilities: any) => {
    if (probabilities) {
      setHoverInfo({ x, probabilities });
    } else {
      setHoverInfo(null);
    }
  };

  const currentLogLikelihood = gmmHistory[currentStep]?.logLikelihood ?? -Infinity;
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gaussian Mixture Model Explorer
          </h1>
          <p className="text-gray-600">
            Interactive tool for exploring 1D Gaussian mixture models and the EM algorithm
          </p>
          <div className="text-xs text-gray-400 mt-1">
            v2.0.1 - Automated Deployment Active
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            <FileUpload onDataLoad={handleDataLoad} />
            
            <EMControls
              currentStep={currentStep}
              totalSteps={gmmHistory.length}
              isRunning={isRunning}
              converged={converged}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              onRunToConvergence={handleRunToConvergence}
              onStop={handleStop}
              logLikelihood={currentLogLikelihood}
            />
            
            {data.length > 0 && components.length > 0 && (
              <GMMChart
                data={data}
                components={components}
                onComponentDrag={handleComponentDrag}
                onHover={handleHover}
                width={800}
                height={500}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {components.length > 0 && (
              <ParameterPanel
                components={components}
                hoverInfo={hoverInfo}
                onComponentCountChange={handleComponentCountChange}
              />
            )}
          </div>

          <div className="space-y-6">
            {components.length > 0 && (
              <MathFormulasPanel componentCount={components.length} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}