'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GaussianComponent, GaussianMixtureModel } from '@/lib/gmm';
import { KMeansCluster } from '@/lib/kmeans';
import { AlgorithmMode } from '@/lib/algorithmTypes';
import { getComponentColor } from '@/lib/colors';

interface GMMChartProps {
  data: number[];
  components?: GaussianComponent[];
  clusters?: KMeansCluster[];
  mode?: AlgorithmMode;
  onComponentDrag?: (index: number, newMu: number, newPi: number) => void;
  onCentroidDrag?: (index: number, newCentroid: number) => void;
  onHover?: (x: number, info: { 
    probabilities?: { total: number, componentProbs: number[], posteriors: number[] };
    clusterDistances?: number[];
    nearestCluster?: number;
  } | null) => void;
  width?: number;
  height?: number;
  curveVisibility?: {
    mixture: boolean;
    components: boolean;
    posteriors: boolean;
    dataPoints: boolean;
  };
}

export default function GMMChart({ 
  data, 
  components = [],
  clusters = [],
  mode = AlgorithmMode.GMM,
  onComponentDrag, 
  onCentroidDrag,
  onHover,
  width = 800, 
  height = 400,
  curveVisibility = {
    mixture: true,
    components: true,
    posteriors: true,
    dataPoints: true
  }
}: GMMChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [hoverLine, setHoverLine] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, initialMu: number} | null>(null);

  const margin = { top: 20, right: 220, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Determine which mode we're in and what data to use
    const isKMeans = mode === AlgorithmMode.KMEANS;
    const elementCount = isKMeans ? clusters.length : components.length;

    const dataExtent = d3.extent(data) as [number, number];
    const dataRange = dataExtent[1] - dataExtent[0];
    const xMin = dataExtent[0] - dataRange * 0.1;
    const xMax = dataExtent[1] + dataRange * 0.1;

    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, chartWidth]);

    // Initialize variables for both modes
    let mixtureValues: Array<{x: number, y: number}> = [];
    let componentCurves: Array<Array<{x: number, y: number}>> = [];
    let posteriorCurves: Array<Array<{x: number, y: number}>> = [];
    let initialMaxY = 0;
    let clusterAssignments: number[] = [];
    let centroids: number[] = [];

    if (isKMeans) {
      // K-means visualization preparation
      centroids = clusters.map(cluster => cluster.centroid);
      
      // Assign each data point to nearest cluster
      clusterAssignments = data.map(point => {
        let nearestCluster = 0;
        let minDistance = Math.abs(point - centroids[0]);
        
        for (let i = 1; i < centroids.length; i++) {
          const distance = Math.abs(point - centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCluster = i;
          }
        }
        return nearestCluster;
      });
      
      initialMaxY = Math.max(data.length * 0.1, 10); // Base height for visualization
    } else {
      // GMM visualization preparation (original logic)
      const gmm = new GaussianMixtureModel(data);
      
      const xValues = d3.range(xMin, xMax, (xMax - xMin) / 200);
      mixtureValues = xValues.map(x => {
        const result = gmm.evaluateMixture(x, components);
        return { x, y: result.total };
      });

      componentCurves = components.map((comp, i) => 
        xValues.map(x => ({
          x,
          y: comp.pi * gmm.gaussianPDF(x, comp.mu, comp.sigma)
        }))
      );

      // Calculate initial maxY from mixture and components
      initialMaxY = Math.max(
        d3.max(mixtureValues, d => d.y) || 0,
        ...componentCurves.map(curve => d3.max(curve, d => d.y) || 0)
      );

      // Calculate posterior probabilities for each component (original 0-1 scale)
      posteriorCurves = components.map((comp, i) => 
        xValues.map(x => {
          const probabilities = gmm.evaluateMixture(x, components);
          return {
            x,
            y: probabilities.posteriors[i] // Keep original 0-1 scale
          };
        })
      );
    }

    // Primary y-axis for densities (left side)
    const maxY = initialMaxY;
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([chartHeight, 0]);

    // Secondary y-axis for posteriors (right side, 0-1 scale)
    const yScalePosterior = d3.scaleLinear()
      .domain([0, 1])
      .range([chartHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add clipping path to prevent overflow
    svg.append('defs').append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    const chartArea = g.append('g')
      .attr('clip-path', 'url(#chart-clip)');

    // Axis colors based on theme
    const axisColor = isDarkMode ? '#d1d5db' : '#374151';
    const textColor = isDarkMode ? '#f3f4f6' : '#111827';

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', textColor);

    g.selectAll('.domain, .tick line')
      .style('stroke', axisColor);

    // Left y-axis for densities
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', textColor);

    g.selectAll('.domain, .tick line')
      .style('stroke', axisColor);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text('Probability Density');

    // Right y-axis for posteriors (only if posteriors are visible)
    if (curveVisibility.posteriors) {
      g.append('g')
        .attr('transform', `translate(${chartWidth}, 0)`)
        .call(d3.axisRight(yScalePosterior))
        .selectAll('text')
        .style('fill', textColor);

      g.selectAll('.domain, .tick line')
        .style('stroke', axisColor);

      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', 0 - chartWidth - margin.right + 15)
        .attr('x', chartHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', textColor)
        .text('Posterior Probability');
    }

    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text('Value');

    // Add legend (positioned in the right margin)
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${chartWidth + 20}, 20)`);

    // Legend background with theme support
    const legendBgColor = isDarkMode ? '#374151' : 'white';
    const legendBorderColor = isDarkMode ? '#6b7280' : 'gray';
    
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -5)
      .attr('width', 190)
      .attr('height', 95)
      .attr('fill', legendBgColor)
      .attr('stroke', legendBorderColor)
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .attr('rx', 4);

    // Legend items with theme-aware colors and visibility indicators
    const mixtureCurveColor = isDarkMode ? '#f3f4f6' : 'black';
    const legendData = isKMeans ? [
      { 
        label: 'Cluster Centroids', 
        stroke: getComponentColor(0), 
        strokeWidth: 3, 
        dashArray: 'none',
        visible: true,
        key: 'mixture' as keyof typeof curveVisibility
      },
      { 
        label: 'Cluster Boundaries', 
        stroke: getComponentColor(0), 
        strokeWidth: 1, 
        dashArray: '5,5',
        visible: curveVisibility.components,
        key: 'components' as keyof typeof curveVisibility
      },
      { 
        label: 'Data Points (Colored)', 
        stroke: 'steelblue', 
        strokeWidth: 2, 
        dashArray: 'none',
        visible: curveVisibility.dataPoints,
        key: 'dataPoints' as keyof typeof curveVisibility
      }
    ] : [
      { 
        label: 'Mixture Distribution', 
        stroke: mixtureCurveColor, 
        strokeWidth: 3, 
        dashArray: 'none',
        visible: curveVisibility.mixture,
        key: 'mixture' as keyof typeof curveVisibility
      },
      { 
        label: 'Component Densities', 
        stroke: getComponentColor(0), 
        strokeWidth: 1.5, 
        dashArray: '5,5',
        visible: curveVisibility.components,
        key: 'components' as keyof typeof curveVisibility
      },
      { 
        label: 'Posteriors (right axis)', 
        stroke: getComponentColor(0), 
        strokeWidth: 2, 
        dashArray: '2,3',
        visible: curveVisibility.posteriors,
        key: 'posteriors' as keyof typeof curveVisibility
      },
      { 
        label: 'Data Points', 
        stroke: 'steelblue', 
        strokeWidth: 2, 
        dashArray: 'none',
        visible: curveVisibility.dataPoints,
        key: 'dataPoints' as keyof typeof curveVisibility
      }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Visibility indicator (eye icon or checkbox)
    legendItems.append('circle')
      .attr('cx', -5)
      .attr('cy', 0)
      .attr('r', 4)
      .attr('fill', d => d.visible ? (isDarkMode ? '#10b981' : '#059669') : 'transparent')
      .attr('stroke', d => d.visible ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#6b7280' : '#9ca3af'))
      .attr('stroke-width', 1.5);

    // Sample line
    legendItems.append('line')
      .attr('x1', 5)
      .attr('x2', 25)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', d => d.visible ? d.stroke : (isDarkMode ? '#6b7280' : '#9ca3af'))
      .attr('stroke-width', d => d.strokeWidth)
      .attr('stroke-dasharray', d => d.dashArray === 'none' ? null : d.dashArray)
      .attr('opacity', d => d.visible ? 1 : 0.5);

    legendItems.append('text')
      .attr('x', 30)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', d => d.visible ? textColor : (isDarkMode ? '#6b7280' : '#9ca3af'))
      .text(d => d.label);

    const line = d3.line<{x: number, y: number}>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCardinal);

    const linePosterior = d3.line<{x: number, y: number}>()
      .x(d => xScale(d.x))
      .y(d => yScalePosterior(d.y))
      .curve(d3.curveCardinal);

    if (isKMeans) {
      // K-means specific visualization
      
      // Draw cluster boundaries (vertical lines between centroids) - only if visible
      if (curveVisibility.components && centroids.length > 1) {
        for (let i = 0; i < centroids.length - 1; i++) {
          const boundary = (centroids[i] + centroids[i + 1]) / 2;
          chartArea.append('line')
            .attr('x1', xScale(boundary))
            .attr('x2', xScale(boundary))
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', isDarkMode ? '#6b7280' : '#9ca3af')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.7);
        }
      }
    } else {
      // GMM specific visualization
      
      // Draw component probability curves (dashed lines) - only if visible
      if (curveVisibility.components) {
        componentCurves.forEach((curve, i) => {
          chartArea.append('path')
            .datum(curve)
            .attr('fill', 'none')
            .attr('stroke', getComponentColor(i))
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '5,5')
            .attr('d', line);
        });
      }

      // Draw posterior probability curves (dotted lines) - only if visible
      if (curveVisibility.posteriors) {
        posteriorCurves.forEach((curve, i) => {
          chartArea.append('path')
            .datum(curve)
            .attr('fill', 'none')
            .attr('stroke', getComponentColor(i))
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '2,3')
            .attr('opacity', 0.8)
            .attr('d', linePosterior); // Use posterior y-scale
        });
      }

      // Draw mixture distribution - only if visible
      if (curveVisibility.mixture) {
        chartArea.append('path')
          .datum(mixtureValues)
          .attr('fill', 'none')
          .attr('stroke', mixtureCurveColor)
          .attr('stroke-width', 3)
          .attr('d', line);
      }
    }

    // Draw data points - only if visible
    if (curveVisibility.dataPoints) {
      const dataPoints = chartArea.selectAll('.data-point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d))
        .attr('cy', chartHeight - 10)
        .attr('r', 3)
        .attr('fill', (d, i) => isKMeans ? getComponentColor(clusterAssignments[i]) : 'steelblue')
        .attr('opacity', 0.6);
    }

    // Declare variables for interactive elements
    let centroidLines: any, centroidVerticalLines: any, centroidHandles: any;
    let muLines: any, meanLines: any, meanHandles: any, piCircles: any;

    // Create interactive elements based on mode
    if (isKMeans) {
      // K-means: Create centroid lines and handles
      centroidLines = g.selectAll('.centroid-line')
        .data(centroids)
        .enter().append('g')
        .attr('class', 'centroid-line');

      // Centroid lines (in clipped area for proper visual boundaries)
      centroidVerticalLines = chartArea.selectAll('.centroid-vertical-line')
        .data(centroids)
        .enter().append('line')
        .attr('class', 'centroid-vertical-line')
        .attr('x1', (d: number) => xScale(d))
        .attr('x2', (d: number) => xScale(d))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', (d: number, i: number) => getComponentColor(i))
        .attr('stroke-width', 3)
        .attr('opacity', 0.8);

      // Centroid labels (above chart, not clipped)
      centroidLines.append('text')
        .attr('x', (d: number) => xScale(d))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', (d: number, i: number) => getComponentColor(i))
        .text((d: number, i: number) => `C${i + 1}`);

      // Draggable handles for centroids (not clipped)
      centroidHandles = centroidLines.append('rect')
        .attr('x', (d: number) => xScale(d) - 12)
        .attr('y', chartHeight / 2 - 20)
        .attr('width', 24)
        .attr('height', 40)
        .attr('fill', (d: number, i: number) => getComponentColor(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('rx', 4)
        .attr('opacity', 0.9)
        .style('cursor', 'ew-resize')
        .style('pointer-events', 'all')
        .style('z-index', '10');

      // Add centroid handle labels
      centroidLines.append('text')
        .attr('x', (d: number) => xScale(d))
        .attr('y', chartHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .text('C');
    } else {
      // GMM: Create mean lines and handles (original logic)
      muLines = g.selectAll('.mu-line')
        .data(components)
        .enter().append('g')
        .attr('class', 'mu-line');

      // Mean lines (in clipped area for proper visual boundaries)
      meanLines = chartArea.selectAll('.mean-line')
        .data(components)
        .enter().append('line')
        .attr('class', 'mean-line')
        .attr('x1', (d: GaussianComponent) => xScale(d.mu))
        .attr('x2', (d: GaussianComponent) => xScale(d.mu))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', (d: GaussianComponent, i: number) => getComponentColor(i))
        .attr('stroke-width', 2)
        .attr('opacity', 0.7);

      // Mean labels (above chart, not clipped)
      muLines.append('text')
        .attr('x', (d: GaussianComponent) => xScale(d.mu))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', (d: GaussianComponent, i: number) => getComponentColor(i))
        .text((d: GaussianComponent, i: number) => `μ${i + 1}`);

      // Larger, more visible draggable handles for means (not clipped)
      meanHandles = muLines.append('rect')
        .attr('x', (d: GaussianComponent) => xScale(d.mu) - 12)
        .attr('y', chartHeight / 2 - 20)
        .attr('width', 24)
        .attr('height', 40)
        .attr('fill', (d: GaussianComponent, i: number) => getComponentColor(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('rx', 4)
        .attr('opacity', 0.9)
        .style('cursor', 'ew-resize')
        .style('pointer-events', 'all')
        .style('z-index', '10');

      // Add mean handle labels (larger and more visible)
      muLines.append('text')
        .attr('x', (d: GaussianComponent) => xScale(d.mu))
        .attr('y', chartHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .text('μ');

      // Pi circles (not clipped for better interaction)
      piCircles = muLines.append('circle')
        .attr('cx', (d: GaussianComponent) => xScale(d.mu))
        .attr('cy', (d: GaussianComponent) => yScale(d.pi * maxY))
        .attr('r', 10)
        .attr('fill', (d: GaussianComponent, i: number) => getComponentColor(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .style('cursor', 'move')
        .style('pointer-events', 'all');
    }

    // Apply drag behaviors based on mode
    if (isKMeans) {
      // K-means centroid drag behavior
      const centroidDragBehavior = d3.drag<SVGRectElement, number>()
        .on('start', function(event, d) {
          const index = centroids.indexOf(d);
          setIsDragging(index);
          event.sourceEvent.stopPropagation();
          
          const [startX] = d3.pointer(event.sourceEvent, g.node());
          setDragStart({ x: startX, initialMu: d });
          
          // Highlight the corresponding centroid line
          centroidVerticalLines.filter((lineData: number, lineIndex: number) => lineIndex === index)
            .attr('stroke-width', 5)
            .attr('opacity', 1);
        })
        .on('drag', function(event, d) {
          const index = centroids.indexOf(d);
          
          if (!dragStart) return;
          
          const [currentX] = d3.pointer(event.sourceEvent, g.node());
          const deltaX = currentX - dragStart.x;
          const deltaXInScale = xScale.invert(dragStart.x + deltaX) - xScale.invert(dragStart.x);
          const newCentroid = dragStart.initialMu + deltaXInScale;
          const newX = xScale(newCentroid);
          
          // Update centroid handle position
          d3.select(this)
            .attr('x', newX - 12);
          
          // Update centroid line position
          centroidVerticalLines.filter((lineData: number, lineIndex: number) => lineIndex === index)
            .attr('x1', newX)
            .attr('x2', newX);
          
          // Update centroid label position
          d3.select(this.parentNode as Element)
            .selectAll('text')
            .attr('x', newX);
          
          // Call the centroid drag handler
          if (onCentroidDrag) {
            onCentroidDrag(index, newCentroid);
          }
        })
        .on('end', function(event) {
          setIsDragging(null);
          setDragStart(null);
          event.sourceEvent.stopPropagation();
          
          // Restore normal centroid line appearance
          centroidVerticalLines.attr('stroke-width', 3)
            .attr('opacity', 0.8);
        });

      // Apply centroid drag behavior
      centroidHandles.call(centroidDragBehavior);
    } else {
      // GMM drag behaviors (original logic)
      const meanDragBehavior = d3.drag<SVGRectElement, GaussianComponent>()
        .on('start', function(event, d) {
          const index = components.indexOf(d);
          setIsDragging(index);
          event.sourceEvent.stopPropagation();
          
          const [startX] = d3.pointer(event.sourceEvent, g.node());
          setDragStart({ x: startX, initialMu: d.mu });
          
          meanLines.filter((lineData: GaussianComponent, lineIndex: number) => lineIndex === index)
            .attr('stroke-width', 4)
            .attr('opacity', 1);
        })
        .on('drag', function(event, d) {
          const index = components.indexOf(d);
          
          if (!dragStart) return;
          
          const [currentX] = d3.pointer(event.sourceEvent, g.node());
          const deltaX = currentX - dragStart.x;
          const deltaXInScale = xScale.invert(dragStart.x + deltaX) - xScale.invert(dragStart.x);
          const newMu = dragStart.initialMu + deltaXInScale;
          const newX = xScale(newMu);
          
          d3.select(this)
            .attr('x', newX - 12);
          
          meanLines.filter((lineData: GaussianComponent, lineIndex: number) => lineIndex === index)
            .attr('x1', newX)
            .attr('x2', newX);
          
          d3.select(this.parentNode as Element)
            .selectAll('text')
            .attr('x', newX);
          
          d3.select(this.parentNode as Element)
            .select('circle')
            .attr('cx', newX);
          
          onComponentDrag?.(index, newMu, d.pi);
        })
        .on('end', function(event) {
          setIsDragging(null);
          setDragStart(null);
          event.sourceEvent.stopPropagation();
          
          meanLines.attr('stroke-width', 2)
            .attr('opacity', 0.7);
        });

      const piDragBehavior = d3.drag<SVGCircleElement, GaussianComponent>()
        .container(g.node()!)
        .on('start', function(event, d) {
          const index = components.indexOf(d);
          setIsDragging(index);
          event.sourceEvent.stopPropagation();
        })
        .on('drag', function(event, d) {
          const index = components.indexOf(d);
          
          const newMu = xScale.invert(event.x);
          const newPi = Math.max(0.01, Math.min(0.99, (yScale.invert(event.y)) / maxY));
          
          d3.select(this)
            .attr('cx', event.x)
            .attr('cy', event.y);
          
          meanLines.filter((lineData: GaussianComponent, lineIndex: number) => lineIndex === index)
            .attr('x1', event.x)
            .attr('x2', event.x);
          
          d3.select(this.parentNode as Element)
            .selectAll('text')
            .attr('x', event.x);
            
          d3.select(this.parentNode as Element)
            .select('rect')
            .attr('x', event.x - 12);
          
          onComponentDrag?.(index, newMu, newPi);
        })
        .on('end', function(event) {
          setIsDragging(null);
          event.sourceEvent.stopPropagation();
        });

      // Apply GMM drag behaviors
      meanHandles.call(meanDragBehavior);
      piCircles.call(piDragBehavior);
    }

    // Add hover functionality first (so it's behind interactive elements)
    if (onHover) {
      const hoverRect = g.insert('rect', ':first-child') // Insert as first child to be behind everything
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .style('cursor', 'crosshair')

      const hoverLineElement = g.append('line')
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0);

      hoverRect
        .on('mousemove', function(event) {
          if (isDragging !== null) return;
          
          const [mouseX] = d3.pointer(event);
          const x = xScale.invert(mouseX);
          
          setHoverLine(x);
          
          hoverLineElement
            .attr('x1', mouseX)
            .attr('x2', mouseX)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('opacity', 1);
          
          if (isKMeans) {
            // K-means hover info: calculate distances to centroids
            const clusterDistances = centroids.map(centroid => Math.abs(x - centroid));
            const nearestClusterIndex = clusterDistances.indexOf(Math.min(...clusterDistances));
            
            onHover(x, {
              clusterDistances,
              nearestCluster: nearestClusterIndex
            });
          } else {
            // GMM hover info: calculate probabilities
            const gmm = new GaussianMixtureModel(data);
            const probabilities = gmm.evaluateMixture(x, components);
            onHover(x, { probabilities });
          }
        })
        .on('mouseleave', function() {
          if (isDragging !== null) return;
          
          setHoverLine(null);
          hoverLineElement.attr('opacity', 0);
          onHover(0, null);
        })
        .on('mousedown', function(event) {
          // Don't interfere with drag events on interactive elements
          const target = event.target as Element;
          if (target.tagName === 'rect' || target.tagName === 'circle') {
            event.stopPropagation();
          }
        });
    }

  }, [data, components, clusters, mode, onComponentDrag, onCentroidDrag, onHover, width, height, isDragging, curveVisibility, dragStart]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
    </div>
  );
}