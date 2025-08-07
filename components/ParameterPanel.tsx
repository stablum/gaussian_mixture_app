'use client';

import React from 'react';
import { GaussianComponent } from '@/lib/gmm';
import { KMeansCluster } from '@/lib/kmeans';
import { Gaussian2D, Point2D, Matrix2x2 } from '@/lib/gaussian2d';
import { getComponentColor } from '@/lib/colors';
import { AlgorithmMode, PARAMETER_NAMES } from '@/lib/algorithmTypes';
import CollapsiblePanel from './ui/CollapsiblePanel';
import FormInput, { FormLabel, ReadOnlyDisplay } from './ui/FormInput';
import NumericInput from './ui/NumericInput';

interface ParameterPanelProps {
  mode?: AlgorithmMode;
  components?: GaussianComponent[];
  clusters?: KMeansCluster[];
  gaussian2d?: Gaussian2D | null;
  hoverInfo?: {
    x: number | Point2D;
    probabilities?: {
      total: number;
      componentProbs: number[];
      posteriors: number[];
    };
    clusterDistances?: number[];
    nearestCluster?: number;
    density?: number;
    mahalanobisDistance?: number;
    euclideanDistance?: number;
    error?: string;
  } | null;
  onComponentCountChange: (newCount: number) => void;
  onParameterChange?: (index: number, parameter: 'mu' | 'sigma' | 'pi', value: number) => void;
  onCentroidChange?: (index: number, value: number) => void;
  onGaussian2DChange?: (newMu: Point2D) => void;
  onGaussian2DCovarianceChange?: (newSigma: Matrix2x2) => void;
}

export default function ParameterPanel({ 
  mode = AlgorithmMode.GMM,
  components, 
  clusters,
  gaussian2d,
  hoverInfo, 
  onComponentCountChange,
  onParameterChange,
  onCentroidChange,
  onGaussian2DChange,
  onGaussian2DCovarianceChange
}: ParameterPanelProps) {
  const isKMeans = mode === AlgorithmMode.KMEANS;
  const isGaussian2D = mode === AlgorithmMode.GAUSSIAN_2D;
  const data = isKMeans ? clusters : (isGaussian2D ? null : components);
  const count = isGaussian2D ? 1 : (data?.length || 0);

  const title = isGaussian2D ? '2D Gaussian Parameters' : (isKMeans ? 'Cluster Parameters' : 'Component Parameters');

  const headerContent = !isGaussian2D ? (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {isKMeans ? 'Clusters:' : 'Components:'}
      </label>
      <select
        value={count}
        onChange={(e) => onComponentCountChange(parseInt(e.target.value))}
        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  ) : null;

  return (
    <CollapsiblePanel 
      title={title}
      headerExtra={headerContent}
    >
      <div className="space-y-4">
        {isGaussian2D ? (
          // 2D Gaussian display
          gaussian2d && (
                <div className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-800 transition-colors"
                     style={{ borderLeftColor: getComponentColor(0), borderLeftWidth: '4px' }}>
                  <h4 className="font-medium mb-3" style={{ color: getComponentColor(0) }}>
                    2D Gaussian Distribution
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Mean vector */}
                    <div>
                      <label className="font-medium block mb-2 text-sm text-gray-900 dark:text-gray-100">
                        Mean Vector (μ):
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FormLabel>μₓ:</FormLabel>
                          <NumericInput
                            value={gaussian2d.mu.x}
                            onChange={(value) => onGaussian2DChange?.({ 
                              x: value, 
                              y: gaussian2d.mu.y 
                            })}
                            step={0.1}
                            decimalPlaces={3}
                          />
                        </div>
                        <div>
                          <FormLabel>μᵧ:</FormLabel>
                          <NumericInput
                            value={gaussian2d.mu.y}
                            onChange={(value) => onGaussian2DChange?.({ 
                              x: gaussian2d.mu.x, 
                              y: value 
                            })}
                            step={0.1}
                            decimalPlaces={3}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Covariance matrix (editable) */}
                    <div>
                      <label className="font-medium block mb-2 text-sm text-gray-900 dark:text-gray-100">
                        Covariance Matrix (Σ):
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">σ₁₁:</label>
                          <NumericInput
                            value={gaussian2d.sigma.xx}
                            onChange={(value) => onGaussian2DCovarianceChange?.({
                              ...gaussian2d.sigma,
                              xx: value
                            })}
                            step={0.01}
                            min={0.01}
                            decimalPlaces={4}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">σ₁₂:</label>
                          <NumericInput
                            value={gaussian2d.sigma.xy}
                            onChange={(value) => onGaussian2DCovarianceChange?.({
                              ...gaussian2d.sigma,
                              xy: value
                            })}
                            step={0.01}
                            decimalPlaces={4}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">σ₂₁:</label>
                                          <ReadOnlyDisplay value={gaussian2d.sigma.xy.toFixed(4)} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">σ₂₂:</label>
                          <NumericInput
                            value={gaussian2d.sigma.yy}
                            onChange={(value) => onGaussian2DCovarianceChange?.({
                              ...gaussian2d.sigma,
                              yy: value
                            })}
                            step={0.01}
                            min={0.01}
                            decimalPlaces={4}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div>
                      <label className="font-medium block mb-2 text-sm text-gray-900 dark:text-gray-100">
                        Statistics:
                      </label>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Det(Σ):</span>
                          <span className="ml-2 font-mono text-gray-900 dark:text-white">
                            {(gaussian2d.sigma.xx * gaussian2d.sigma.yy - gaussian2d.sigma.xy * gaussian2d.sigma.xy).toFixed(6)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Correlation:</span>
                          <span className="ml-2 font-mono text-gray-900 dark:text-white">
                            {(gaussian2d.sigma.xy / Math.sqrt(gaussian2d.sigma.xx * gaussian2d.sigma.yy)).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : isKMeans ? (
              // K-means clusters display
              clusters?.map((cluster, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-800 transition-colors"
                  style={{ borderLeftColor: getComponentColor(index), borderLeftWidth: '4px' }}
                >
                  <h4 className="font-medium mb-2" style={{ color: getComponentColor(index) }}>
                    Cluster {index + 1}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <label className="font-medium block mb-1">{PARAMETER_NAMES[mode].primary}:</label>
                      <NumericInput
                        value={cluster.centroid}
                        onChange={(value) => onCentroidChange?.(index, value)}
                        step={0.1}
                        decimalPlaces={3}
                      />
                    </div>
                    
                    <div>
                      <label className="font-medium block mb-1">{PARAMETER_NAMES[mode].secondary}:</label>
                      <div className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-mono">
                        {cluster.size}
                      </div>
                    </div>
                    
                    <div>
                      <label className="font-medium block mb-1">{PARAMETER_NAMES[mode].weight}:</label>
                      <div className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-mono">
                        {cluster.points.length}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // GMM components display
              components?.map((component, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-800 transition-colors"
                  style={{ borderLeftColor: getComponentColor(index), borderLeftWidth: '4px' }}
                >
                  <h4 className="font-medium mb-2" style={{ color: getComponentColor(index) }}>
                    Component {index + 1}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <label className="font-medium block mb-1">μ (Mean):</label>
                      <NumericInput
                        value={component.mu}
                        onChange={(value) => onParameterChange?.(index, 'mu', value)}
                        step={0.1}
                        decimalPlaces={3}
                      />
                    </div>
                    
                    <div>
                      <label className="font-medium block mb-1">σ (Std):</label>
                      <NumericInput
                        value={component.sigma}
                        onChange={(value) => onParameterChange?.(index, 'sigma', value)}
                        step={0.1}
                        min={0.01}
                        decimalPlaces={3}
                      />
                    </div>
                    
                    <div>
                      <label className="font-medium block mb-1">π (Weight):</label>
                      <NumericInput
                        value={component.pi}
                        onChange={(value) => onParameterChange?.(index, 'pi', value)}
                        step={0.01}
                        min={0.01}
                        max={0.99}
                        decimalPlaces={3}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {(hoverInfo || isGaussian2D) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                {isGaussian2D ? (
                  hoverInfo && typeof hoverInfo.x === 'object' ? 
                    `Query at (${hoverInfo.x.x.toFixed(3)}, ${hoverInfo.x.y.toFixed(3)})` :
                    `Query Point (hover over chart to see coordinates)`
                ) : (
                  `Query at x = ${typeof hoverInfo?.x === 'number' ? hoverInfo.x.toFixed(3) : '0.000'}`
                )}
              </h4>
              
              <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                {isGaussian2D ? (
                  // 2D Gaussian hover info
                  <>
                    {hoverInfo?.density !== undefined ? (
                      <div>
                        <span className="font-medium">Probability Density:</span>
                        <span className="ml-2 font-mono">{hoverInfo.density.toFixed(6)}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">Probability Density:</span>
                        <span className="ml-2 font-mono text-gray-500 dark:text-gray-400">Hover over chart to see density</span>
                      </div>
                    )}
                    
                    {hoverInfo?.euclideanDistance !== undefined ? (
                      <div>
                        <span className="font-medium">Euclidean Distance:</span>
                        <span className="ml-2 font-mono">{hoverInfo.euclideanDistance.toFixed(3)}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">Euclidean Distance:</span>
                        <span className="ml-2 font-mono text-gray-500 dark:text-gray-400">Hover over chart to see distance</span>
                      </div>
                    )}
                    
                    {hoverInfo?.mahalanobisDistance !== undefined ? (
                      <div>
                        <span className="font-medium">Mahalanobis Distance:</span>
                        <span className="ml-2 font-mono">{hoverInfo.mahalanobisDistance.toFixed(3)}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">Mahalanobis Distance:</span>
                        <span className="ml-2 font-mono text-gray-500 dark:text-gray-400">Fit Gaussian first</span>
                      </div>
                    )}
                    
                    {gaussian2d && hoverInfo?.density !== undefined && (
                      <>
                        <div>
                          <span className="font-medium">Relative Density:</span>
                          <span className="ml-2 font-mono">
                            {(() => {
                              const det = gaussian2d.sigma.xx * gaussian2d.sigma.yy - gaussian2d.sigma.xy * gaussian2d.sigma.xy;
                              const maxDensity = 1 / (2 * Math.PI * Math.sqrt(det));
                              return (hoverInfo!.density / maxDensity).toFixed(4);
                            })()}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Query at μ = ({gaussian2d.mu.x.toFixed(3)}, {gaussian2d.mu.y.toFixed(3)})
                          <br />
                          Mahalanobis distance accounts for correlation and scale
                        </div>
                      </>
                    )}
                    
                    {!gaussian2d && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Fit a Gaussian distribution to see density and distance calculations.
                        <br />
                        Generate 2D sample data first, then click "Fit Gaussian (MLE)".
                      </div>
                    )}
                  </>
                ) : isKMeans && hoverInfo?.clusterDistances && Array.isArray(hoverInfo.clusterDistances) && hoverInfo.clusterDistances.length > 0 ? (
                  // K-means hover info
                  <>
                    <div>
                      <span className="font-medium">Nearest Cluster:</span>
                      <span className="ml-2 font-mono" style={{ color: getComponentColor(hoverInfo?.nearestCluster || 0) }}>
                        Cluster {(hoverInfo?.nearestCluster || 0) + 1}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Distances to Centroids:</span>
                      <div className="mt-1 space-y-1">
                        {hoverInfo.clusterDistances?.map((distance, index) => (
                          <div key={index} className="flex justify-between">
                            <span style={{ color: getComponentColor(index) }}>Cluster {index + 1}:</span>
                            <span className="font-mono">{distance.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : hoverInfo?.probabilities ? (
                  // GMM hover info
                  <>
                    <div>
                      <span className="font-medium">Total Probability:</span>
                      <span className="ml-2 font-mono">{hoverInfo.probabilities?.total.toFixed(4)}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Component Probabilities:</span>
                      <div className="mt-1 space-y-1">
                        {hoverInfo.probabilities?.componentProbs && Array.isArray(hoverInfo.probabilities.componentProbs) ? 
                          hoverInfo.probabilities.componentProbs?.map((prob, index) => (
                            <div key={index} className="flex justify-between">
                              <span style={{ color: getComponentColor(index) }}>Component {index + 1}:</span>
                              <span className="font-mono">{prob.toFixed(4)}</span>
                            </div>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Posterior Probabilities:</span>
                      <div className="mt-1 space-y-1">
                        {hoverInfo.probabilities?.posteriors && Array.isArray(hoverInfo.probabilities.posteriors) ? 
                          hoverInfo.probabilities.posteriors?.map((posterior, index) => (
                            <div key={index} className="flex justify-between">
                              <span style={{ color: getComponentColor(index) }}>P(Component {index + 1} | x):</span>
                              <span className="font-mono">{posterior.toFixed(4)}</span>
                            </div>
                          )) : null
                        }
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Posterior probabilities sum to: {
                        hoverInfo.probabilities?.posteriors && Array.isArray(hoverInfo.probabilities.posteriors) ? 
                          hoverInfo.probabilities.posteriors?.reduce((sum, p) => sum + p, 0).toFixed(4) :
                          '0.0000'
                      }
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
            <p><strong>Interactive Tips:</strong></p>
            {isKMeans ? (
              <>
                <p>• Drag the rectangular handles to adjust centroid positions</p>
                <p>• Edit centroid values directly in the input fields above</p>
                <p>• Use algorithm controls to run k-means iterations</p>
              </>
            ) : (
              <>
                <p>• Drag the rectangular handles (μ) to adjust means horizontally</p>
                <p>• Drag the colored circles to adjust both μ and π parameters</p>
                <p>• Edit parameters directly in the input fields above</p>
              </>
            )}
          </div>
    </CollapsiblePanel>
  );
}