'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GaussianComponent, GaussianMixtureModel } from '@/lib/gmm';
import { getComponentColor } from '@/lib/colors';

interface GMMChartProps {
  data: number[];
  components: GaussianComponent[];
  onComponentDrag: (index: number, newMu: number, newPi: number) => void;
  onHover?: (x: number, probabilities: { total: number, componentProbs: number[], posteriors: number[] } | null) => void;
  width?: number;
  height?: number;
}

export default function GMMChart({ 
  data, 
  components, 
  onComponentDrag, 
  onHover,
  width = 800, 
  height = 400 
}: GMMChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [hoverLine, setHoverLine] = useState<number | null>(null);

  const margin = { top: 20, right: 220, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    const dataExtent = d3.extent(data) as [number, number];
    const dataRange = dataExtent[1] - dataExtent[0];
    const xMin = dataExtent[0] - dataRange * 0.1;
    const xMax = dataExtent[1] + dataRange * 0.1;

    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, chartWidth]);

    const gmm = new GaussianMixtureModel(data);
    
    const xValues = d3.range(xMin, xMax, (xMax - xMin) / 200);
    const mixtureValues = xValues.map(x => {
      const result = gmm.evaluateMixture(x, components);
      return { x, y: result.total };
    });

    const componentCurves = components.map((comp, i) => 
      xValues.map(x => ({
        x,
        y: comp.pi * gmm.gaussianPDF(x, comp.mu, comp.sigma)
      }))
    );

    // Calculate initial maxY from mixture and components
    const initialMaxY = Math.max(
      d3.max(mixtureValues, d => d.y) || 0,
      ...componentCurves.map(curve => d3.max(curve, d => d.y) || 0)
    );

    // Calculate posterior probabilities for each component (scaled for visibility)
    const posteriorCurves = components.map((comp, i) => 
      xValues.map(x => {
        const probabilities = gmm.evaluateMixture(x, components);
        // Scale posterior by initial max height for visibility
        return {
          x,
          y: probabilities.posteriors[i] * initialMaxY * 0.8 // Scale to 80% of max height
        };
      })
    );

    const maxY = Math.max(
      initialMaxY,
      ...posteriorCurves.map(curve => d3.max(curve, d => d.y) || 0)
    );

    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1])
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
      .attr('height', 75)
      .attr('fill', legendBgColor)
      .attr('stroke', legendBorderColor)
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .attr('rx', 4);

    // Legend items with theme-aware colors
    const mixtureCurveColor = isDarkMode ? '#f3f4f6' : 'black';
    const legendData = [
      { label: 'Mixture Distribution', stroke: mixtureCurveColor, strokeWidth: 3, dashArray: 'none' },
      { label: 'Component Densities', stroke: getComponentColor(0), strokeWidth: 1.5, dashArray: '5,5' },
      { label: 'Posteriors (scaled)', stroke: getComponentColor(0), strokeWidth: 2, dashArray: '2,3' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', d => d.stroke)
      .attr('stroke-width', d => d.strokeWidth)
      .attr('stroke-dasharray', d => d.dashArray === 'none' ? null : d.dashArray);

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', textColor)
      .text(d => d.label);

    const line = d3.line<{x: number, y: number}>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCardinal);

    // Draw component probability curves (dashed lines)
    componentCurves.forEach((curve, i) => {
      chartArea.append('path')
        .datum(curve)
        .attr('fill', 'none')
        .attr('stroke', getComponentColor(i))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);
    });

    // Draw posterior probability curves (dotted lines)
    posteriorCurves.forEach((curve, i) => {
      chartArea.append('path')
        .datum(curve)
        .attr('fill', 'none')
        .attr('stroke', getComponentColor(i))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,3')
        .attr('opacity', 0.8)
        .attr('d', line);
    });

    chartArea.append('path')
      .datum(mixtureValues)
      .attr('fill', 'none')
      .attr('stroke', mixtureCurveColor)
      .attr('stroke-width', 3)
      .attr('d', line);

    const dataPoints = chartArea.selectAll('.data-point')
      .data(data)
      .enter().append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d))
      .attr('cy', chartHeight - 10)
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .attr('opacity', 0.6);

    const muLines = chartArea.selectAll('.mu-line')
      .data(components)
      .enter().append('g')
      .attr('class', 'mu-line');

    muLines.append('line')
      .attr('x1', d => xScale(d.mu))
      .attr('x2', d => xScale(d.mu))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', (d, i) => getComponentColor(i))
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    const piCircles = muLines.append('circle')
      .attr('cx', d => xScale(d.mu))
      .attr('cy', d => yScale(d.pi * maxY))
      .attr('r', 8)
      .attr('fill', (d, i) => getComponentColor(i))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'move');

    let dragBehavior = d3.drag<SVGCircleElement, GaussianComponent>()
      .on('start', function(event, d) {
        const index = components.indexOf(d);
        setIsDragging(index);
      })
      .on('drag', function(event, d) {
        const index = components.indexOf(d);
        const newMu = xScale.invert(event.x);
        const newPi = Math.max(0.01, Math.min(0.99, (yScale.invert(event.y)) / maxY));
        
        d3.select(this)
          .attr('cx', event.x)
          .attr('cy', event.y);
        
        d3.select(this.parentNode as Element)
          .select('line')
          .attr('x1', event.x)
          .attr('x2', event.x);
        
        onComponentDrag(index, newMu, newPi);
      })
      .on('end', function() {
        setIsDragging(null);
      });

    piCircles.call(dragBehavior);

    if (onHover) {
      const hoverRect = g.append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .style('cursor', 'crosshair');

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
          
          const probabilities = gmm.evaluateMixture(x, components);
          onHover(x, probabilities);
        })
        .on('mouseleave', function() {
          if (isDragging !== null) return;
          
          setHoverLine(null);
          hoverLineElement.attr('opacity', 0);
          onHover(0, null);
        });
    }

  }, [data, components, onComponentDrag, onHover, width, height, isDragging]);

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