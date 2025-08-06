'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AlgorithmMode } from '@/lib/algorithmTypes';

interface ConvergenceChartProps {
  data: Array<{
    iteration: number;
    value: number;
  }>;
  mode: AlgorithmMode;
  width?: number;
  height?: number;
  currentIteration?: number;
  onIterationClick?: (iteration: number) => void;
}

export default function ConvergenceChart({ 
  data, 
  mode, 
  width = 400, 
  height = 200, 
  currentIteration = 0,
  onIterationClick
}: ConvergenceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const getTitle = () => {
    switch (mode) {
      case AlgorithmMode.GMM:
        return 'Log-Likelihood Progression';
      case AlgorithmMode.KMEANS:
        return 'Inertia (Total Distance) Progression';
      case AlgorithmMode.GAUSSIAN_2D:
        return 'Log-Likelihood Progression';
      default:
        return 'Convergence Progression';
    }
  };

  const getYAxisLabel = () => {
    switch (mode) {
      case AlgorithmMode.GMM:
        return 'Log-Likelihood';
      case AlgorithmMode.KMEANS:
        return 'Inertia (Total Distance)';
      case AlgorithmMode.GAUSSIAN_2D:
        return 'Log-Likelihood';
      default:
        return 'Value';
    }
  };

  const formatValue = (value: number) => {
    if (mode === AlgorithmMode.KMEANS) {
      return value.toFixed(2);
    }
    return value.toFixed(3);
  };

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || isCollapsed) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.iteration) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Line generator
    const line = d3.line<{ iteration: number; value: number }>()
      .x(d => xScale(d.iteration))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Iteration');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => formatValue(Number(d))))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(getYAxisLabel());

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.3);

    // Add the line
    const linePath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', mode === AlgorithmMode.KMEANS ? '#f59e0b' : '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.iteration))
      .attr('cy', d => yScale(d.value))
      .attr('r', 3)
      .attr('fill', mode === AlgorithmMode.KMEANS ? '#f59e0b' : '#3b82f6')
      .style('opacity', 0.8)
      .style('cursor', onIterationClick ? 'pointer' : 'default');

    // Highlight current iteration
    if (currentIteration >= 0 && currentIteration < data.length) {
      g.append('circle')
        .attr('cx', xScale(data[currentIteration].iteration))
        .attr('cy', yScale(data[currentIteration].value))
        .attr('r', 5)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .style('opacity', 0.9);
    }

    // Add value labels on hover
    const tooltip = d3.select('body').append('div')
      .attr('class', 'convergence-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    g.selectAll('.dot')
      .on('mouseover', function(event, d: any) {
        // Highlight the point on hover
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 4)
          .style('opacity', 1);
          
        tooltip.transition().duration(200).style('opacity', .9);
        const tooltipText = onIterationClick 
          ? `Iteration: ${d.iteration}<br/>${getYAxisLabel()}: ${formatValue(d.value)}<br/><em>Click to navigate</em>`
          : `Iteration: ${d.iteration}<br/>${getYAxisLabel()}: ${formatValue(d.value)}`;
        tooltip.html(tooltipText)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        // Reset point on mouse out (unless it's the current iteration)
        const d = d3.select(this).datum() as any;
        if (d.iteration !== data[currentIteration]?.iteration) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', 3)
            .style('opacity', 0.8);
        }
        
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('click', function(event, d: any) {
        if (onIterationClick) {
          // Find the index of the clicked iteration in the data array
          const clickedIndex = data.findIndex(point => point.iteration === d.iteration);
          if (clickedIndex >= 0) {
            onIterationClick(clickedIndex);
            
            // Visual feedback for the click
            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 5)
              .transition()
              .duration(200)
              .attr('r', 4);
          }
        }
      });

    return () => {
      d3.select('body').selectAll('.convergence-tooltip').remove();
    };
  }, [data, width, height, currentIteration, mode, isCollapsed, onIterationClick]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md p-1 -m-1 transition-colors"
          title={isCollapsed ? "Show convergence chart" : "Hide convergence chart"}
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {getTitle()}
          </h4>
        </button>
        <div className="flex items-center gap-2">
          {!isCollapsed && data.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {data.length} iterations
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isCollapsed ? "Show convergence chart" : "Hide convergence chart"}
          >
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-3">
          <svg 
            ref={svgRef} 
            width={width} 
            height={height}
            className="w-full max-w-full text-gray-600 dark:text-gray-400"
          />
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <strong>Teaching Tip:</strong> {
                mode === AlgorithmMode.KMEANS 
                  ? 'Lower inertia values indicate better clustering. Convergence occurs when centroids stop moving.'
                  : 'Higher log-likelihood values indicate better fit. Convergence occurs when the rate of improvement becomes negligible.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}