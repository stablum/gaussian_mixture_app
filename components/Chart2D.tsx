'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Gaussian2D, Point2D, Gaussian2DAlgorithm } from '@/lib/gaussian2d';
import { getComponentColor } from '@/lib/colors';

interface Chart2DProps {
  data: Point2D[];
  gaussian?: Gaussian2D | null;
  onGaussianDrag?: (newMu: Point2D) => void;
  onHover?: (point: Point2D, info: { 
    density?: number;
    mahalanobisDistance?: number;
    euclideanDistance?: number;
    error?: string;
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

export default function Chart2D({ 
  data, 
  gaussian,
  onGaussianDrag,
  onHover,
  width = 800, 
  height = 600,
  curveVisibility = {
    mixture: true,
    components: true,
    posteriors: true,
    dataPoints: true
  }
}: Chart2DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const margin = { top: 20, right: 220, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Calculate domain including data points and Gaussian mean position
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    
    // Include Gaussian mean position if available
    if (gaussian) {
      xValues.push(gaussian.mu.x);
      yValues.push(gaussian.mu.y);
    }
    
    const xExtent = d3.extent(xValues) as [number, number];
    const yExtent = d3.extent(yValues) as [number, number];
    
    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];
    
    // Handle edge cases for very small ranges or identical values
    let xPadding, yPadding;
    if (xRange < 0.01) {
      xPadding = 1; // Fixed padding for very small or zero range
    } else {
      xPadding = Math.max(0.5, xRange * 0.15);
    }
    
    if (yRange < 0.01) {
      yPadding = 1; // Fixed padding for very small or zero range  
    } else {
      yPadding = Math.max(0.5, yRange * 0.15);
    }

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([chartHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add clipping path
    svg.append('defs').append('clipPath')
      .attr('id', 'chart2d-clip')
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    const chartArea = g.append('g')
      .attr('clip-path', 'url(#chart2d-clip)');

    // Theme colors
    const axisColor = isDarkMode ? '#d1d5db' : '#374151';
    const textColor = isDarkMode ? '#f3f4f6' : '#111827';

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', textColor);

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', textColor);

    g.selectAll('.domain, .tick line')
      .style('stroke', axisColor);

    // Axis labels
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text('X');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text('Y');

    // Draw data points - only if visible
    if (curveVisibility.dataPoints) {
      chartArea.selectAll('.data-point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    }

    // Draw Gaussian visualization if available
    if (gaussian) {
      const gaussianAlg = new Gaussian2DAlgorithm(data);
      
      // Draw confidence ellipses (controlled by 'components' visibility)
      if (curveVisibility.components) {
        const contourLevels = [1, 2, 3]; // 1σ, 2σ, 3σ
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        contourLevels.forEach((level, i) => {
          const contourPoints = gaussianAlg.generateContourPoints(gaussian, level * level);
          
          if (contourPoints.length > 0) {
            const line = d3.line<Point2D>()
              .x(d => xScale(d.x))
              .y(d => yScale(d.y))
              .curve(d3.curveCardinalClosed);

            chartArea.append('path')
              .datum(contourPoints)
              .attr('fill', 'none')
              .attr('stroke', colors[i])
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', i === 0 ? 'none' : '5,5')
              .attr('opacity', 0.8)
              .attr('d', line);
          }
        });
      }

      // Draw probability density heatmap (controlled by 'mixture' visibility)
      if (curveVisibility.mixture) {
        // Create a grid for the heatmap
        const gridSize = 30;
        const xValues = d3.range(gridSize).map(i => xScale.domain()[0] + i * (xScale.domain()[1] - xScale.domain()[0]) / (gridSize - 1));
        const yValues = d3.range(gridSize).map(i => yScale.domain()[0] + i * (yScale.domain()[1] - yScale.domain()[0]) / (gridSize - 1));
        
        const heatmapData: { x: number; y: number; value: number }[] = [];
        let maxValue = 0;
        
        for (const x of xValues) {
          for (const y of yValues) {
            const point = { x, y };
            const density = gaussianAlg.evaluatePDF(point, gaussian);
            heatmapData.push({ x, y, value: density });
            maxValue = Math.max(maxValue, density);
          }
        }
        
        // Create color scale for heatmap
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
          .domain([0, maxValue]);
        
        // Draw heatmap rectangles
        const cellWidth = chartWidth / gridSize;
        const cellHeight = chartHeight / gridSize;
        
        chartArea.selectAll('.heatmap-cell')
          .data(heatmapData)
          .enter().append('rect')
          .attr('class', 'heatmap-cell')
          .attr('x', d => xScale(d.x) - cellWidth / 2)
          .attr('y', d => yScale(d.y) - cellHeight / 2)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('fill', d => colorScale(d.value))
          .attr('opacity', 0.6);
      }

      // Draw mean point (controlled by 'posteriors' visibility)
      if (curveVisibility.posteriors) {
        const meanHandle = chartArea.append('circle')
          .attr('cx', xScale(gaussian.mu.x))
          .attr('cy', yScale(gaussian.mu.y))
          .attr('r', 8)
          .attr('fill', getComponentColor(0))
          .attr('stroke', 'white')
          .attr('stroke-width', 3)
          .style('cursor', 'move')
          .style('pointer-events', 'all');

        // Add mean label
        chartArea.append('text')
          .attr('x', xScale(gaussian.mu.x))
          .attr('y', yScale(gaussian.mu.y) - 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', getComponentColor(0))
          .text('μ');

        // Add drag behavior for mean
        if (onGaussianDrag) {
          const dragBehavior = d3.drag<SVGCircleElement, unknown>()
            .container(g.node()!)
            .on('start', function() {
              setIsDragging(true);
            })
            .on('drag', function(event) {
              const newMu: Point2D = {
                x: xScale.invert(event.x),
                y: yScale.invert(event.y)
              };
              
              // Update visual position
              d3.select(this)
                .attr('cx', event.x)
                .attr('cy', event.y);
                
              // Update label position
              chartArea.select('text')
                .attr('x', event.x)
                .attr('y', event.y - 15);
              
              onGaussianDrag(newMu);
            })
            .on('end', function() {
              setIsDragging(false);
            });

          meanHandle.call(dragBehavior);
        }
      }
    }

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${chartWidth + 20}, 20)`);

    const legendBgColor = isDarkMode ? '#374151' : 'white';
    const legendBorderColor = isDarkMode ? '#6b7280' : 'gray';
    
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -5)
      .attr('width', 190)
      .attr('height', 140)
      .attr('fill', legendBgColor)
      .attr('stroke', legendBorderColor)
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .attr('rx', 4);

    const legendData = [
      { 
        label: 'Data Points', 
        stroke: 'steelblue', 
        strokeWidth: 2, 
        dashArray: 'none',
        visible: curveVisibility.dataPoints,
        key: 'dataPoints' as keyof typeof curveVisibility
      },
      { 
        label: 'Density Heatmap', 
        stroke: d3.interpolateBlues(0.7), 
        strokeWidth: 4, 
        dashArray: 'none',
        visible: curveVisibility.mixture,
        key: 'mixture' as keyof typeof curveVisibility,
        isHeatmap: true
      },
      { 
        label: '1σ Confidence', 
        stroke: '#ff6b6b', 
        strokeWidth: 2, 
        dashArray: 'none',
        visible: curveVisibility.components,
        key: 'components' as keyof typeof curveVisibility
      },
      { 
        label: '2σ Confidence', 
        stroke: '#4ecdc4', 
        strokeWidth: 2, 
        dashArray: '5,5',
        visible: curveVisibility.components,
        key: 'components' as keyof typeof curveVisibility
      },
      { 
        label: '3σ Confidence', 
        stroke: '#45b7d1', 
        strokeWidth: 2, 
        dashArray: '5,5',
        visible: curveVisibility.components,
        key: 'components' as keyof typeof curveVisibility
      },
      { 
        label: 'Mean (μ)', 
        stroke: getComponentColor(0), 
        strokeWidth: 3, 
        dashArray: 'none',
        visible: curveVisibility.posteriors,
        key: 'posteriors' as keyof typeof curveVisibility
      }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Visibility indicators
    legendItems.append('circle')
      .attr('cx', -5)
      .attr('cy', 0)
      .attr('r', 4)
      .attr('fill', d => d.visible ? (isDarkMode ? '#10b981' : '#059669') : 'transparent')
      .attr('stroke', d => d.visible ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#6b7280' : '#9ca3af'))
      .attr('stroke-width', 1.5);

    // Sample lines (or rectangles for heatmap)
    legendItems.each(function(d) {
      const item = d3.select(this);
      
      if ((d as any).isHeatmap) {
        // Draw filled rectangle for heatmap
        item.append('rect')
          .attr('x', 5)
          .attr('y', -3)
          .attr('width', 20)
          .attr('height', 6)
          .attr('fill', d.visible ? d.stroke : (isDarkMode ? '#6b7280' : '#9ca3af'))
          .attr('opacity', d.visible ? 0.8 : 0.5);
      } else {
        // Draw line for other elements
        item.append('line')
          .attr('x1', 5)
          .attr('x2', 25)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', d.visible ? d.stroke : (isDarkMode ? '#6b7280' : '#9ca3af'))
          .attr('stroke-width', d.strokeWidth)
          .attr('stroke-dasharray', d.dashArray === 'none' ? null : d.dashArray)
          .attr('opacity', d.visible ? 1 : 0.5);
      }
    });

    legendItems.append('text')
      .attr('x', 30)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', d => d.visible ? textColor : (isDarkMode ? '#6b7280' : '#9ca3af'))
      .text(d => d.label);

    // Add hover functionality
    if (onHover) {
      const hoverRect = g.insert('rect', ':first-child')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .style('cursor', 'crosshair');

      const hoverCircle = g.append('circle')
        .attr('r', 3)
        .attr('fill', 'red')
        .attr('opacity', 0);

      hoverRect
        .on('mousemove', function(event) {
          if (isDragging) return;
          
          const [mouseX, mouseY] = d3.pointer(event);
          const point: Point2D = {
            x: xScale.invert(mouseX),
            y: yScale.invert(mouseY)
          };
          
          hoverCircle
            .attr('cx', mouseX)
            .attr('cy', mouseY)
            .attr('opacity', 1);
          
          if (gaussian) {
            try {
              const gaussianAlg = new Gaussian2DAlgorithm(data);
              const density = gaussianAlg.evaluatePDF(point, gaussian);
              
              // Calculate Mahalanobis distance
              const dx = point.x - gaussian.mu.x;
              const dy = point.y - gaussian.mu.y;
              const sigmaInverse = gaussianAlg.calculateInverse(gaussian.sigma);
              let mahalanobisDistance = 0;
              
              if (sigmaInverse) {
                const mahalanobisSq = dx * dx * sigmaInverse.xx + 
                                    2 * dx * dy * sigmaInverse.xy + 
                                    dy * dy * sigmaInverse.yy;
                mahalanobisDistance = Math.sqrt(Math.max(0, mahalanobisSq));
              }
              
              onHover(point, { 
                density, 
                mahalanobisDistance,
                euclideanDistance: Math.sqrt(dx * dx + dy * dy)
              });
            } catch (error) {
              console.error('Error calculating 2D hover density:', error);
              onHover(point, { error: 'Failed to calculate density' });
            }
          } else {
            // Show basic position information even without fitted Gaussian
            onHover(point, { 
              density: undefined,
              mahalanobisDistance: undefined,
              euclideanDistance: undefined
            });
          }
        })
        .on('mouseleave', function() {
          if (isDragging) return;
          
          hoverCircle.attr('opacity', 0);
          onHover({ x: 0, y: 0 }, null);
        });
    }

  }, [data, gaussian, onGaussianDrag, onHover, width, height, isDragging, curveVisibility]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
    </div>
  );
}