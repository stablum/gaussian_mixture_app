'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLogLikelihoodUpdater } from '@/hooks/useLogLikelihoodUpdater';
import { GaussianComponent, GaussianMixtureModel, GMMState, GMMHistoryStep } from '@/lib/gmm';
import { KMeansAlgorithm, KMeansHistoryStep, KMeansCluster } from '@/lib/kmeans';
import { Gaussian2D, Point2D, Matrix2x2, Gaussian2DAlgorithm, Gaussian2DHistoryStep, Gaussian2DState } from '@/lib/gaussian2d';
import { AlgorithmMode } from '@/lib/algorithmTypes';
import { generateSimpleSampleData, generateSimpleSampleData2D } from '@/lib/csvParser';
import GMMChart from '@/components/GMMChart';
import Chart2D from '@/components/Chart2D';
import FileUpload from '@/components/FileUpload';
import FileUpload2D from '@/components/FileUpload2D';
import EMControls from '@/components/EMControls';
import KMeansControls from '@/components/KMeansControls';
import Gaussian2DControls from '@/components/Gaussian2DControls';
import GradientDescentControls from '@/components/GradientDescentControls';
import ParameterPanel from '@/components/ParameterPanel';
import MathFormulasPanel from '@/components/MathFormulasPanel';
import Gaussian2DFormulasPanel from '@/components/Gaussian2DFormulasPanel';
import CurveVisibilityControls from '@/components/CurveVisibilityControls';
import AlgorithmModeSwitch from '@/components/AlgorithmModeSwitch';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  // Algorithm mode state
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>(AlgorithmMode.GMM);
  
  // Common state
  const [data, setData] = useState<number[] | Point2D[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [converged, setConverged] = useState(false);
  
  // GMM specific state
  const [components, setComponents] = useState<GaussianComponent[]>([]);
  const [gmmHistory, setGmmHistory] = useState<GMMHistoryStep[]>([]);
  
  // K-means specific state
  const [clusters, setClusters] = useState<KMeansCluster[]>([]);
  const [kmeansHistory, setKmeansHistory] = useState<KMeansHistoryStep[]>([]);
  
  // 2D Gaussian specific state
  const [gaussian2d, setGaussian2d] = useState<Gaussian2D | null>(null);
  const [gaussian2dHistory, setGaussian2dHistory] = useState<Gaussian2DHistoryStep[]>([]);
  
  // Gradient descent specific state
  const [isGradientDescentMode, setIsGradientDescentMode] = useState(false);
  const [gradientDescentState, setGradientDescentState] = useState<Gaussian2DState | null>(null);
  const [gradientDescentStep, setGradientDescentStep] = useState(0);
  const [learningRate, setLearningRate] = useState(0.01);
  
  // Hover info state (unified for all modes)
  const [hoverInfo, setHoverInfo] = useState<{
    x: number | Point2D;
    probabilities?: {
      total: number;
      componentProbs: number[];
      posteriors: number[];
    };
    clusterDistances?: number[];
    nearestCluster?: number;
    density?: number;
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Log-likelihood updater hook
  const { 
    logLikelihoodState, 
    scheduleLogLikelihoodUpdate, 
    markAsStale, 
    cleanup 
  } = useLogLikelihoodUpdater();

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
      cleanup(); // Clean up any pending log-likelihood calculations
    };
  }, [cleanup]);
  
  // Initialize separate curve visibility states for each mode with performance-conscious defaults
  const [curveVisibilities, setCurveVisibilities] = useState({
    [AlgorithmMode.GMM]: {
      mixture: true, // Mixture distribution
      components: true, // Component densities
      posteriors: true, // Posteriors (scaled)
      dataPoints: true
    },
    [AlgorithmMode.KMEANS]: {
      mixture: true, // Cluster centroids
      components: true, // Cluster boundaries  
      posteriors: false, // Not used in K-means
      dataPoints: true
    },
    [AlgorithmMode.GAUSSIAN_2D]: {
      mixture: false, // Start heatmap disabled for better performance
      components: true, // Confidence ellipses
      posteriors: true, // Mean point (μ)
      dataPoints: true
    }
  });

  // Get current visibility state based on algorithm mode
  const curveVisibility = curveVisibilities[algorithmMode];

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

  const initializeGaussian2D = useCallback((newData: Point2D[]) => {
    if (newData.length === 0) return;
    
    const gaussian2dAlg = new Gaussian2DAlgorithm(newData);
    const initialGaussian = gaussian2dAlg.initializeGaussian();
    
    setGaussian2d(initialGaussian);
    setGaussian2dHistory([{
      gaussian: initialGaussian,
      iteration: 0,
      logLikelihood: initialGaussian.logLikelihood
    }]);
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
    
    if (newMode === AlgorithmMode.GAUSSIAN_2D) {
      // Switch to 2D data
      const sampleData2D = generateSimpleSampleData2D(100);
      setData(sampleData2D);
      initializeGaussian2D(sampleData2D);
    } else if (newMode === AlgorithmMode.KMEANS) {
      // Switch to 1D data if coming from 2D mode
      if (algorithmMode === AlgorithmMode.GAUSSIAN_2D) {
        const sampleData1D = generateSimpleSampleData(100);
        setData(sampleData1D);
        initializeKMeans(sampleData1D, 2);
      } else {
        initializeKMeans(data as number[], components.length || 2);
      }
    } else { // GMM mode
      // Switch to 1D data if coming from 2D mode
      if (algorithmMode === AlgorithmMode.GAUSSIAN_2D) {
        const sampleData1D = generateSimpleSampleData(100);
        setData(sampleData1D);
        initializeGMM(sampleData1D, 2);
      } else {
        initializeGMM(data as number[], clusters.length || 2);
      }
    }
  }, [algorithmMode, data, components.length, clusters.length, initializeGMM, initializeKMeans, initializeGaussian2D]);

  useEffect(() => {
    const sampleData = generateSimpleSampleData(100);
    setData(sampleData);
    initializeGMM(sampleData, 2);
  }, [initializeGMM]);

  const handleDataLoad = (newData: number[]) => {
    if (algorithmMode === AlgorithmMode.GAUSSIAN_2D) {
      // Can't load 1D data into 2D mode, ignore or handle gracefully
      return;
    }
    
    setData(newData);
    if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(newData, components.length);
    } else {
      initializeKMeans(newData, clusters.length || 2);
    }
  };

  const handleDataLoad2D = (newData: Point2D[]) => {
    if (algorithmMode !== AlgorithmMode.GAUSSIAN_2D) {
      // Can't load 2D data into 1D modes, ignore or handle gracefully
      return;
    }
    
    setData(newData);
    // Reset any existing Gaussian fitting
    setGaussian2d(null);
    setGaussian2dHistory([]);
    setCurrentStep(0);
    setConverged(false);
    setIsGradientDescentMode(false);
    setGradientDescentState(null);
    setGradientDescentStep(0);
  };

  const handleComponentCountChange = (newCount: number) => {
    if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(data as number[], newCount);
    } else {
      initializeKMeans(data as number[], newCount);
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

    // Schedule log-likelihood update with debouncing
    scheduleLogLikelihoodUpdate(
      AlgorithmMode.GMM,
      data as number[],
      newComponents,
      (newLogLikelihood) => {
        if (gmmHistory.length > 0) {
          setGmmHistory(prev => {
            const updated = [...prev];
            updated[currentStep] = {
              ...updated[currentStep],
              logLikelihood: newLogLikelihood
            };
            return updated;
          });
        }
      },
      500 // Debounce dragging with 500ms delay
    );
  };

  const handleStepForward = () => {
    if (currentStep >= gmmHistory.length - 1 && !converged) {
      const gmm = new GaussianMixtureModel(data as number[], components.length);
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
    if (algorithmMode === AlgorithmMode.GAUSSIAN_2D) {
      if (isGradientDescentMode) {
        handleGradientDescentReset();
      } else {
        initializeGaussian2D(data as Point2D[]);
      }
    } else if (algorithmMode === AlgorithmMode.GMM) {
      initializeGMM(data as number[], components.length);
    } else {
      initializeKMeans(data as number[], clusters.length);
    }
  };

  // 2D Gaussian handlers
  const handleGaussian2DFit = () => {
    if (algorithmMode !== AlgorithmMode.GAUSSIAN_2D || !data.length) return;
    
    setIsRunning(true);
    const gaussian2dAlg = new Gaussian2DAlgorithm(data as Point2D[]);
    const fittedGaussian = gaussian2dAlg.fitGaussian();
    
    setGaussian2d(fittedGaussian);
    setGaussian2dHistory(prev => [...prev, {
      gaussian: fittedGaussian,
      iteration: prev.length,
      logLikelihood: fittedGaussian.logLikelihood
    }]);
    setCurrentStep(prev => prev + 1);
    setIsRunning(false);
  };

  const handleGaussian2DDrag = (newMu: Point2D) => {
    if (!gaussian2d) return;
    
    const updatedGaussian: Gaussian2D = {
      ...gaussian2d,
      mu: newMu
    };
    
    setGaussian2d(updatedGaussian);

    // Schedule log-likelihood update with debouncing
    scheduleLogLikelihoodUpdate(
      AlgorithmMode.GAUSSIAN_2D,
      data as Point2D[],
      updatedGaussian,
      (newLogLikelihood) => {
        setGaussian2d(prev => prev ? {
          ...prev,
          logLikelihood: newLogLikelihood
        } : prev);
      },
      300 // Shorter debounce for 2D dragging
    );
  };

  const handleGaussian2DCovarianceChange = (newSigma: Matrix2x2) => {
    if (!gaussian2d) return;
    
    const updatedGaussian: Gaussian2D = {
      ...gaussian2d,
      sigma: newSigma
    };
    
    setGaussian2d(updatedGaussian);

    // Schedule log-likelihood update with debouncing
    scheduleLogLikelihoodUpdate(
      AlgorithmMode.GAUSSIAN_2D,
      data as Point2D[],
      updatedGaussian,
      (newLogLikelihood) => {
        setGaussian2d(prev => prev ? {
          ...prev,
          logLikelihood: newLogLikelihood
        } : prev);
      },
      300
    );
  };

  // Gradient descent handlers
  const handleStartGradientDescent = () => {
    if (algorithmMode !== AlgorithmMode.GAUSSIAN_2D || !data.length) return;
    
    setIsGradientDescentMode(true);
    const gaussian2dAlg = new Gaussian2DAlgorithm(data as Point2D[]);
    const initialGaussian = gaussian2d || gaussian2dAlg.initializeGaussian();
    
    const initialState: Gaussian2DState = {
      gaussian: initialGaussian,
      iteration: 0,
      logLikelihood: initialGaussian.logLikelihood,
      converged: false,
      history: [{
        gaussian: initialGaussian,
        iteration: 0,
        logLikelihood: initialGaussian.logLikelihood
      }]
    };
    
    setGradientDescentState(initialState);
    setGradientDescentStep(0);
    setGaussian2d(initialGaussian);
    setCurrentStep(0);
    setConverged(false);
  };

  const handleGradientDescentStepForward = () => {
    if (!gradientDescentState || !data.length) return;
    
    const gaussian2dAlg = new Gaussian2DAlgorithm(data as Point2D[]);
    const currentGaussian = gradientDescentState.history[gradientDescentStep]?.gaussian || gradientDescentState.gaussian;
    
    if (gradientDescentStep < gradientDescentState.history.length - 1) {
      // Move to next existing step
      const nextStep = gradientDescentStep + 1;
      setGradientDescentStep(nextStep);
      setCurrentStep(nextStep);
      setGaussian2d(gradientDescentState.history[nextStep].gaussian);
    } else {
      // Compute new step
      const result = gaussian2dAlg.singleGradientDescentStep(currentGaussian, learningRate);
      const newIteration = gradientDescentState.iteration + 1;
      
      const newHistoryStep: Gaussian2DHistoryStep = {
        gaussian: result.gaussian,
        iteration: newIteration,
        logLikelihood: result.logLikelihood
      };
      
      const updatedState: Gaussian2DState = {
        ...gradientDescentState,
        gaussian: result.gaussian,
        iteration: newIteration,
        logLikelihood: result.logLikelihood,
        history: [...gradientDescentState.history, newHistoryStep]
      };
      
      setGradientDescentState(updatedState);
      setGradientDescentStep(updatedState.history.length - 1);
      setCurrentStep(updatedState.history.length - 1);
      setGaussian2d(result.gaussian);
      
      // Check for convergence
      if (gradientDescentState.history.length > 1) {
        const prevLogLikelihood = gradientDescentState.history[gradientDescentState.history.length - 1].logLikelihood;
        const logLikelihoodChange = Math.abs(result.logLikelihood - prevLogLikelihood);
        if (logLikelihoodChange < 1e-6) {
          setConverged(true);
        }
      }
    }
  };

  const handleGradientDescentStepBackward = () => {
    if (!gradientDescentState || gradientDescentStep <= 0) return;
    
    const prevStep = gradientDescentStep - 1;
    setGradientDescentStep(prevStep);
    setCurrentStep(prevStep);
    setGaussian2d(gradientDescentState.history[prevStep].gaussian);
    setConverged(false);
  };

  const handleGradientDescentReset = () => {
    if (!data.length) return;
    
    const gaussian2dAlg = new Gaussian2DAlgorithm(data as Point2D[]);
    const initialGaussian = gaussian2dAlg.initializeGaussian();
    
    const initialState: Gaussian2DState = {
      gaussian: initialGaussian,
      iteration: 0,
      logLikelihood: initialGaussian.logLikelihood,
      converged: false,
      history: [{
        gaussian: initialGaussian,
        iteration: 0,
        logLikelihood: initialGaussian.logLikelihood
      }]
    };
    
    setGradientDescentState(initialState);
    setGradientDescentStep(0);
    setGaussian2d(initialGaussian);
    setCurrentStep(0);
    setConverged(false);
    setIsRunning(false);
  };

  const handleGradientDescentRunToConvergence = async () => {
    if (!gradientDescentState || !data.length) return;
    
    setIsRunning(true);
    const gaussian2dAlg = new Gaussian2DAlgorithm(data as Point2D[]);
    const currentGaussian = gradientDescentState.history[gradientDescentStep]?.gaussian || gradientDescentState.gaussian;
    
    const result = await new Promise<Gaussian2DState>((resolve) => {
      setTimeout(() => {
        const state = gaussian2dAlg.fitWithGradientDescent(currentGaussian, learningRate);
        resolve(state);
      }, 100);
    });
    
    // Merge existing history with new results
    const mergedHistory = [
      ...gradientDescentState.history.slice(0, gradientDescentStep + 1),
      ...result.history.slice(1) // Skip the first step as it's the current state
    ];
    
    const finalState: Gaussian2DState = {
      ...result,
      history: mergedHistory
    };
    
    setGradientDescentState(finalState);
    setGradientDescentStep(finalState.history.length - 1);
    setCurrentStep(finalState.history.length - 1);
    setGaussian2d(result.gaussian);
    setConverged(result.converged);
    setIsRunning(false);
  };

  const handleGradientDescentStop = () => {
    setIsRunning(false);
  };

  const handleLearningRateChange = (rate: number) => {
    setLearningRate(rate);
  };

  const handleExitGradientDescent = () => {
    setIsGradientDescentMode(false);
    setGradientDescentState(null);
    setGradientDescentStep(0);
    setCurrentStep(0);
    setConverged(false);
    setIsRunning(false);
  };

  const handleRunToConvergence = async () => {
    setIsRunning(true);
    setConverged(false);
    
    const gmm = new GaussianMixtureModel(data as number[], components.length);
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
      const kmeans = new KMeansAlgorithm(data as number[], clusters.length);
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

  // Navigation handlers for chart click functionality
  const handleNavigateToGMMStep = (step: number) => {
    if (step >= 0 && step < gmmHistory.length) {
      setCurrentStep(step);
      setComponents(JSON.parse(JSON.stringify(gmmHistory[step].components)));
    }
  };

  const handleNavigateToKMeansStep = (step: number) => {
    if (step >= 0 && step < kmeansHistory.length) {
      setCurrentStep(step);
      setClusters(JSON.parse(JSON.stringify(kmeansHistory[step].clusters)));
    }
  };

  const handleNavigateToGradientDescentStep = (step: number) => {
    if (gradientDescentState && step >= 0 && step < gradientDescentState.history.length) {
      setGradientDescentStep(step);
      setCurrentStep(step);
      const stepData = gradientDescentState.history[step];
      if (stepData && stepData.gaussian) {
        setGaussian2d(stepData.gaussian);
      }
    }
  };

  const handleKMeansReset = () => {
    initializeKMeans(data as number[], clusters.length);
  };

  const handleKMeansRunToConvergence = async () => {
    setIsRunning(true);
    setConverged(false);
    
    if (clusters.length === 0) {
      console.warn('No clusters available for K-means run to convergence');
      setIsRunning(false);
      return;
    }
    
    const kmeans = new KMeansAlgorithm(data as number[], clusters.length);
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

  const handleHover = (x: number | Point2D, info: any) => {
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
    setCurveVisibilities(prev => ({
      ...prev,
      [algorithmMode]: {
        ...prev[algorithmMode],
        [key]: value
      }
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

    // Schedule log-likelihood update
    scheduleLogLikelihoodUpdate(
      AlgorithmMode.GMM,
      data as number[],
      newComponents,
      (newLogLikelihood) => {
        if (gmmHistory.length > 0) {
          setGmmHistory(prev => {
            const updated = [...prev];
            updated[currentStep] = {
              ...updated[currentStep],
              logLikelihood: newLogLikelihood
            };
            return updated;
          });
        }
      },
      400 // Debounce parameter panel changes
    );
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

    // Schedule total distance update for K-means
    scheduleLogLikelihoodUpdate(
      AlgorithmMode.KMEANS,
      data as number[],
      newClusters,
      (newTotalDistance) => {
        if (kmeansHistory.length > 0) {
          setKmeansHistory(prev => {
            const updated = [...prev];
            updated[currentStep] = {
              ...updated[currentStep],
              inertia: newTotalDistance
            };
            return updated;
          });
        }
      },
      400
    );
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
                Interactive tool for exploring 1D Gaussian mixture models, K-means clustering, and 2D Gaussian fitting
              </p>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                v3.6.10 - TESTS: Added comprehensive test coverage for convergence chart feature. Includes unit tests for ConvergenceChart component and integration tests for all algorithm control panels with convergence visualization.
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
            
            {algorithmMode === AlgorithmMode.GAUSSIAN_2D ? (
              <FileUpload2D onDataLoad={handleDataLoad2D} />
            ) : (
              <FileUpload onDataLoad={handleDataLoad} />
            )}
            
            {algorithmMode === AlgorithmMode.GAUSSIAN_2D ? (
              !isGradientDescentMode ? (
                <Gaussian2DControls
                  gaussian={gaussian2d}
                  isRunning={isRunning}
                  onFit={handleGaussian2DFit}
                  onReset={handleReset}
                  onStartGradientDescent={handleStartGradientDescent}
                  showGradientDescent={true}
                  logLikelihoodState={logLikelihoodState}
                />
              ) : (
                <GradientDescentControls
                  currentStep={gradientDescentStep}
                  totalSteps={gradientDescentState?.history.length || 1}
                  isRunning={isRunning}
                  converged={converged}
                  onStepForward={handleGradientDescentStepForward}
                  onStepBackward={handleGradientDescentStepBackward}
                  onReset={handleGradientDescentReset}
                  onRunToConvergence={handleGradientDescentRunToConvergence}
                  onStop={handleGradientDescentStop}
                  onExit={handleExitGradientDescent}
                  onNavigateToStep={handleNavigateToGradientDescentStep}
                  logLikelihood={gradientDescentState?.history[gradientDescentStep]?.logLikelihood || 0}
                  learningRate={learningRate}
                  onLearningRateChange={handleLearningRateChange}
                  gradientDescentHistory={gradientDescentState?.history || []}
                />
              )
            ) : algorithmMode === AlgorithmMode.GMM ? (
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
                onNavigateToStep={handleNavigateToGMMStep}
                logLikelihood={currentLogLikelihood}
                logLikelihoodState={logLikelihoodState}
                gmmHistory={gmmHistory}
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
                onNavigateToStep={handleNavigateToKMeansStep}
                inertia={kmeansHistory[currentStep]?.inertia || 0}
                logLikelihoodState={logLikelihoodState}
                kmeansHistory={kmeansHistory}
              />
            )}
            
            {data.length > 0 && (
              algorithmMode === AlgorithmMode.GAUSSIAN_2D ? (
                <Chart2D
                  data={data as Point2D[]}
                  gaussian={gaussian2d}
                  onGaussianDrag={handleGaussian2DDrag}
                  onHover={handleHover}
                  width={800}
                  height={600}
                  curveVisibility={curveVisibility}
                />
              ) : (algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0) && (
                <GMMChart
                  data={data as number[]}
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
              )
            )}
          </div>
          
          <div className="space-y-6">
            <CurveVisibilityControls
              mode={algorithmMode}
              visibility={curveVisibility}
              onVisibilityChange={handleVisibilityChange}
            />
            
            {(algorithmMode === AlgorithmMode.GAUSSIAN_2D ? gaussian2d : (algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0)) && (
              <ParameterPanel
                mode={algorithmMode}
                components={algorithmMode === AlgorithmMode.GMM ? components : undefined}
                clusters={algorithmMode === AlgorithmMode.KMEANS ? clusters : undefined}
                gaussian2d={algorithmMode === AlgorithmMode.GAUSSIAN_2D ? gaussian2d : undefined}
                hoverInfo={hoverInfo}
                onComponentCountChange={handleComponentCountChange}
                onParameterChange={handleParameterChange}
                onCentroidChange={handleCentroidChange}
                onGaussian2DChange={handleGaussian2DDrag}
                onGaussian2DCovarianceChange={handleGaussian2DCovarianceChange}
              />
            )}
            
            {algorithmMode === AlgorithmMode.GAUSSIAN_2D ? (
              <Gaussian2DFormulasPanel />
            ) : (algorithmMode === AlgorithmMode.GMM ? components.length > 0 : clusters.length > 0) && (
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