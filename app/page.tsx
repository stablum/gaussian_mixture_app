'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GaussianComponent, GaussianMixtureModel, GMMState, GMMHistoryStep } from '@/lib/gmm';
import { KMeansAlgorithm, KMeansHistoryStep, KMeansCluster } from '@/lib/kmeans';
import { AlgorithmMode } from '@/lib/algorithmTypes';
import { generateSimpleSampleData } from '@/lib/csvParser';
import GMMChart from '@/components/GMMChart';
import FileUpload from '@/components/FileUpload';
import EMControls from '@/components/EMControls';
import KMeansControls from '@/components/KMeansControls';
import ParameterPanel from '@/components/ParameterPanel';
import MathFormulasPanel from '@/components/MathFormulasPanel';
import CurveVisibilityControls from '@/components/CurveVisibilityControls';
import AlgorithmModeSwitch from '@/components/AlgorithmModeSwitch';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  // Algorithm mode state
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>(AlgorithmMode.GMM);
  
  // Common state
  const [data, setData] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [converged, setConverged] = useState(false);
  
  // GMM specific state
  const [components, setComponents] = useState<GaussianComponent[]>([]);
  const [gmmHistory, setGmmHistory] = useState<GMMHistoryStep[]>([]);
  
  // K-means specific state
  const [clusters, setClusters] = useState<KMeansCluster[]>([]);
  const [kmeansHistory, setKmeansHistory] = useState<KMeansHistoryStep[]>([]);
  
  // Hover info state (unified for both modes)
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    probabilities?: {
      total: number;
      componentProbs: number[];
      posteriors: number[];
    };
    clusterDistances?: number[];
    nearestCluster?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      setError(`Unhandled error: ${event.message} at ${event.filename}:${event.lineno}`);
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(`Unhandled promise rejection: ${event.reason}`);
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  const [curveVisibility, setCurveVisibility] = useState({
    mixture: true,
    components: true,
    posteriors: true,
    dataPoints: true
  });

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

  const initializeKMeans = useCallback((newData: number[], k: number = 2) => {
    if (newData.length === 0) return;
    
    const kmeans = new KMeansAlgorithm(newData, k);
    const initialCentroids = kmeans.initializeCentroidsSimple();
    const initialResult = kmeans.singleIteration(initialCentroids);
    initialResult.iteration = 0;
    
    setClusters(initialResult.clusters);
    setKmeansHistory([initialResult]);
    setCurrentStep(0);
    setConverged(false);
    setIsRunning(false);
  }, []);

  const handleModeChange = useCallback((newMode: AlgorithmMode) => {
    setAlgorithmMode(newMode);
    setCurrentStep(0);
    setConverged(false);
    setIsRunning(false);
    setHoverInfo(null);
    
    if (newMode === AlgorithmMode.KMEANS) {
      initializeKMeans(data, components.length || 2);
    } else {
      initializeGMM(data, clusters.length || 2);
    }
  }, [data, components.length, clusters.length, initializeGMM, initializeKMeans]);

  useEffect(() => {
    const sampleData = generateSimpleSampleData(100);
    setData(sampleData);
    initializeGMM(sampleData, 2);
  }, [initializeGMM]);

  const handleDataLoad = (newData: number[]) => {
    setData(newData);
    if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(newData, components.length);
    } else {
      initializeKMeans(newData, clusters.length || 2);
    }
  };

  const handleComponentCountChange = (newCount: number) => {
    if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(data, newCount);
    } else {
      initializeKMeans(data, newCount);
    }
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
    if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(data, components.length);
    } else {
      initializeKMeans(data, clusters.length);
    }
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

  // K-means specific handlers
  const handleKMeansStepForward = () => {
    if (currentStep >= kmeansHistory.length - 1 && !converged) {
      if (clusters.length === 0) {
        console.warn('No clusters available for K-means step forward');
        return;
      }
      const kmeans = new KMeansAlgorithm(data, clusters.length);
      const currentCentroids = clusters.map(cluster => cluster.centroid);
      const result = kmeans.singleIteration(currentCentroids);
      result.iteration = currentStep + 1;
      
      const newHistory = [...kmeansHistory, result];
      setKmeansHistory(newHistory);
      setClusters(result.clusters);
      setCurrentStep(currentStep + 1);
      
      // Check for convergence (centroids don't change)
      if (kmeansHistory.length > 0) {
        const prevCentroids = kmeansHistory[kmeansHistory.length - 1].clusters.map(c => c.centroid);
        const newCentroids = result.clusters.map(c => c.centroid);
        const hasConverged = prevCentroids.length === newCentroids.length && 
          prevCentroids.every((centroid, i) => 
            i < newCentroids.length && Math.abs(centroid - newCentroids[i]) < 1e-6
          );
        if (hasConverged) {
          setConverged(true);
        }
      }
    } else if (currentStep < kmeansHistory.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setClusters(JSON.parse(JSON.stringify(kmeansHistory[nextStep].clusters)));
    }
  };

  const handleKMeansStepBackward = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setClusters(JSON.parse(JSON.stringify(kmeansHistory[prevStep].clusters)));
    }
  };

  const handleKMeansReset = () => {
    initializeKMeans(data, clusters.length);
  };

  const handleKMeansRunToConvergence = async () => {
    setIsRunning(true);
    setConverged(false);
    
    if (clusters.length === 0) {
      console.warn('No clusters available for K-means run to convergence');
      setIsRunning(false);
      return;
    }
    
    const kmeans = new KMeansAlgorithm(data, clusters.length);
    let currentCentroids = clusters.map(cluster => cluster.centroid);
    let iteration = currentStep;
    
    const runStep = () => {
      if (iteration >= 200) {
        setIsRunning(false);
        setConverged(true);
        return;
      }
      
      const result = kmeans.singleIteration(currentCentroids);
      result.iteration = iteration + 1;
      currentCentroids = result.clusters.map(cluster => cluster.centroid);
      iteration++;
      
      setKmeansHistory(prev => [...prev, result]);
      setClusters(result.clusters);
      setCurrentStep(iteration);
      
      // Check for convergence  
      if (kmeansHistory.length > 0) {
        const prevCentroids = kmeansHistory[kmeansHistory.length - 1].clusters.map(c => c.centroid);
        const hasConverged = prevCentroids.length === currentCentroids.length &&
          prevCentroids.every((centroid, i) => 
            i < currentCentroids.length && Math.abs(centroid - currentCentroids[i]) < 1e-6
          );
        
        if (hasConverged) {
          setIsRunning(false);
          setConverged(true);
          return;
        }
      }
      
      setTimeout(runStep, 200);
    };
    
    setTimeout(runStep, 200);
  };

  const handleKMeansStop = () => {
    setIsRunning(false);
  };

  const handleHover = (x: number, info: any) => {
    try {
      if (info) {
        if (info.error) {
          setError(info.error);
          setHoverInfo(null);
        } else {
          setHoverInfo({ x, ...info });
          setError(null); // Clear any previous errors
        }
      } else {
        setHoverInfo(null);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Hover handler error: ${errorMessage}`);
      console.error('Hover handler error:', error);
    }
  };

  const handleVisibilityChange = (key: keyof typeof curveVisibility, value: boolean) => {
    setCurveVisibility(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleParameterChange = (index: number, parameter: 'mu' | 'sigma' | 'pi', value: number) => {
    const newComponents = [...components];
    newComponents[index] = {
      ...newComponents[index],
      [parameter]: value
    };
    
    // If π (pi) was changed, normalize all weights to sum to 1
    if (parameter === 'pi') {
      const totalPi = newComponents.reduce((sum, comp) => sum + comp.pi, 0);
      if (totalPi > 0) {
        newComponents.forEach(comp => comp.pi /= totalPi);
      }
    }
    
    setComponents(newComponents);
    
    // Update current step in history if it exists
    if (gmmHistory.length > 0) {
      const newHistory = [...gmmHistory];
      newHistory[currentStep] = {
        ...newHistory[currentStep],
        components: JSON.parse(JSON.stringify(newComponents))
      };
      setGmmHistory(newHistory);
    }
  };

  const handleCentroidChange = (index: number, value: number) => {
    const newClusters = [...clusters];
    newClusters[index] = {
      ...newClusters[index],
      centroid: value
    };
    
    setClusters(newClusters);
    
    // Update current step in history if it exists
    if (kmeansHistory.length > 0) {
      const newHistory = [...kmeansHistory];
      newHistory[currentStep] = {
        ...newHistory[currentStep],
        clusters: JSON.parse(JSON.stringify(newClusters))
      };
      setKmeansHistory(newHistory);
    }
  };

  const currentLogLikelihood = gmmHistory[currentStep]?.logLikelihood ?? -Infinity;
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Machine Learning Algorithm Explorer
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive tool for exploring 1D Gaussian mixture models and K-means clustering algorithms
              </p>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                v3.2.5 - Dual Algorithm Mode (GMM + K-means)
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-semibold">Application Error</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1 font-mono">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AlgorithmModeSwitch 
              currentMode={algorithmMode}
              onModeChange={handleModeChange}
            />
            
            <FileUpload onDataLoad={handleDataLoad} />
            
            {algorithmMode === AlgorithmMode.GMM ? (
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
            ) : (
              <KMeansControls
                currentStep={currentStep}
                totalSteps={kmeansHistory.length}
                isRunning={isRunning}
                converged={converged}
                onStepForward={handleKMeansStepForward}
                onStepBackward={handleKMeansStepBackward}
                onReset={handleKMeansReset}
                onRunToConvergence={handleKMeansRunToConvergence}
                onStop={handleKMeansStop}
                inertia={kmeansHistory[currentStep]?.inertia || 0}
              />
            )}
            
            {data.length > 0 && (algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0) && (
              <GMMChart
                data={data}
                components={algorithmMode === AlgorithmMode.GMM ? components : []}
                clusters={algorithmMode === AlgorithmMode.KMEANS ? clusters : []}
                mode={algorithmMode}
                onComponentDrag={handleComponentDrag}
                onCentroidDrag={handleCentroidChange}
                onHover={handleHover}
                width={800}
                height={500}
                curveVisibility={curveVisibility}
              />
            )}
          </div>
          
          <div className="space-y-6">
            <CurveVisibilityControls
              mode={algorithmMode}
              visibility={curveVisibility}
              onVisibilityChange={handleVisibilityChange}
            />
            
            {(algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0) && (
              <ParameterPanel
                mode={algorithmMode}
                components={algorithmMode === AlgorithmMode.GMM ? components : undefined}
                clusters={algorithmMode === AlgorithmMode.KMEANS ? clusters : undefined}
                hoverInfo={hoverInfo}
                onComponentCountChange={handleComponentCountChange}
                onParameterChange={handleParameterChange}
                onCentroidChange={handleCentroidChange}
              />
            )}
            
            {(algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0) && (
              <MathFormulasPanel 
                componentCount={algorithmMode === AlgorithmMode.GMM ? components.length : clusters.length} 
                mode={algorithmMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}