export interface GaussianComponent {
  mu: number;
  sigma: number;
  pi: number;
}

export interface GMMState {
  components: GaussianComponent[];
  data: number[];
  iteration: number;
  logLikelihood: number;
  converged: boolean;
  history: GMMHistoryStep[];
}

export interface GMMHistoryStep {
  components: GaussianComponent[];
  iteration: number;
  logLikelihood: number;
  responsibilities?: number[][];
}

import { calculateBasicStats, randomInitialization1D, statisticalInitialization1D } from './math';
import { gaussianPDF1D, safeLog } from './math';
import { hasConvergedAbsolute } from './math';

export class GaussianMixtureModel {
  private data: number[];
  private k: number;
  private tolerance: number;
  private maxIterations: number;

  constructor(data: number[], k: number = 2, tolerance: number = 1e-6, maxIterations: number = 100) {
    this.data = data;
    this.k = k;
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
  }

  initializeComponents(): GaussianComponent[] {
    const stats = calculateBasicStats(this.data);
    const components: GaussianComponent[] = [];
    
    // Use statistical initialization for better starting points
    const means = statisticalInitialization1D(this.data, this.k);
    
    for (let i = 0; i < this.k; i++) {
      components.push({
        mu: means[i],
        sigma: stats.standardDeviation * (0.5 + Math.random()),
        pi: 1 / this.k
      });
    }
    
    return components;
  }

  gaussianPDF(x: number, mu: number, sigma: number): number {
    return gaussianPDF1D(x, mu, sigma);
  }

  calculateResponsibilities(components: GaussianComponent[]): number[][] {
    const responsibilities: number[][] = [];
    
    for (let i = 0; i < this.data.length; i++) {
      const x = this.data[i];
      const probs = components.map(comp => 
        comp.pi * this.gaussianPDF(x, comp.mu, comp.sigma)
      );
      
      const totalProb = probs.reduce((sum, p) => sum + p, 0);
      
      if (totalProb === 0) {
        responsibilities.push(new Array(this.k).fill(1 / this.k));
      } else {
        responsibilities.push(probs.map(p => p / totalProb));
      }
    }
    
    return responsibilities;
  }

  expectationStep(components: GaussianComponent[]): number[][] {
    return this.calculateResponsibilities(components);
  }

  maximizationStep(responsibilities: number[][]): GaussianComponent[] {
    const newComponents: GaussianComponent[] = [];
    
    for (let k = 0; k < this.k; k++) {
      const Nk = responsibilities.reduce((sum, resp) => sum + resp[k], 0);
      
      const mu = responsibilities.reduce((sum, resp, i) => 
        sum + resp[k] * this.data[i], 0
      ) / Nk;
      
      const sigma = Math.sqrt(
        responsibilities.reduce((sum, resp, i) => 
          sum + resp[k] * Math.pow(this.data[i] - mu, 2), 0
        ) / Nk
      );
      
      const pi = Nk / this.data.length;
      
      newComponents.push({
        mu: isNaN(mu) ? 0 : mu,
        sigma: isNaN(sigma) || sigma < 0.01 ? 0.1 : sigma,
        pi: isNaN(pi) ? 1 / this.k : pi
      });
    }
    
    const totalPi = newComponents.reduce((sum, comp) => sum + comp.pi, 0);
    newComponents.forEach(comp => comp.pi /= totalPi);
    
    return newComponents;
  }

  calculateLogLikelihood(components: GaussianComponent[]): number {
    let logLikelihood = 0;
    
    for (const x of this.data) {
      const likelihood = components.reduce((sum, comp) => 
        sum + comp.pi * this.gaussianPDF(x, comp.mu, comp.sigma), 0
      );
      
      logLikelihood += safeLog(likelihood);
    }
    
    return logLikelihood;
  }

  singleEMStep(components: GaussianComponent[]): { 
    components: GaussianComponent[], 
    responsibilities: number[][],
    logLikelihood: number 
  } {
    const responsibilities = this.expectationStep(components);
    const newComponents = this.maximizationStep(responsibilities);
    const logLikelihood = this.calculateLogLikelihood(newComponents);
    
    return { components: newComponents, responsibilities, logLikelihood };
  }

  fit(initialComponents?: GaussianComponent[]): GMMState {
    let components = initialComponents || this.initializeComponents();
    let iteration = 0;
    let prevLogLikelihood = -Infinity;
    let logLikelihood = this.calculateLogLikelihood(components);
    
    const history: GMMHistoryStep[] = [{
      components: JSON.parse(JSON.stringify(components)),
      iteration: 0,
      logLikelihood
    }];

    while (iteration < this.maxIterations) {
      const result = this.singleEMStep(components);
      components = result.components;
      prevLogLikelihood = logLikelihood;
      logLikelihood = result.logLikelihood;
      iteration++;

      history.push({
        components: JSON.parse(JSON.stringify(components)),
        iteration,
        logLikelihood,
        responsibilities: result.responsibilities
      });

      if (hasConvergedAbsolute(logLikelihood, prevLogLikelihood, this.tolerance)) {
        break;
      }
    }

    return {
      components,
      data: this.data,
      iteration,
      logLikelihood,
      converged: hasConvergedAbsolute(logLikelihood, prevLogLikelihood, this.tolerance),
      history
    };
  }

  evaluateMixture(x: number, components: GaussianComponent[]): {
    total: number,
    componentProbs: number[],
    posteriors: number[]
  } {
    // Validate components
    const validComponents = components.filter(comp => 
      comp && 
      typeof comp.pi === 'number' && !isNaN(comp.pi) && comp.pi > 0 &&
      typeof comp.mu === 'number' && !isNaN(comp.mu) &&
      typeof comp.sigma === 'number' && !isNaN(comp.sigma) && comp.sigma > 0
    );
    
    if (validComponents.length === 0) {
      return {
        total: 0,
        componentProbs: [],
        posteriors: []
      };
    }
    
    const componentProbs = validComponents.map(comp => 
      comp.pi * this.gaussianPDF(x, comp.mu, comp.sigma)
    );
    
    const total = componentProbs.reduce((sum, p) => sum + p, 0);
    
    const posteriors = total > 0 
      ? componentProbs.map(p => p / total)
      : new Array(validComponents.length).fill(1 / validComponents.length);
    
    return { total, componentProbs, posteriors };
  }
}