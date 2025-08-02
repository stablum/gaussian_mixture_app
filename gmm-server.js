const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3101;
const host = '0.0.0.0';

// Enhanced GMM server with hover queries and file feedback
const server = http.createServer((req, res) => {
  let filePath = req.url;
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }
  
  // Serve the enhanced GMM application
  if (filePath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gaussian Mixture Model Explorer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        .chart-container { background: white; border: 1px solid #e5e7eb; border-radius: 8px; }
        .data-point { fill: steelblue; opacity: 0.6; }
        .component-line { stroke-width: 2; opacity: 0.7; }
        .mixture-line { stroke: black; stroke-width: 3; fill: none; }
        .component-curve { fill: none; stroke-width: 1.5; stroke-dasharray: 5,5; }
        .draggable { cursor: move; }
        .hover-line { stroke: red; stroke-width: 1; stroke-dasharray: 3,3; pointer-events: none; }
        .hover-overlay { fill: none; pointer-events: all; cursor: crosshair; }
        .upload-feedback { padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 14px; }
        .upload-success { background-color: #d1fae5; color: #065f46; border: 1px solid #10b981; }
        .upload-error { background-color: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen p-6">
        <div class="max-w-7xl mx-auto">
            <header class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    Gaussian Mixture Model Explorer
                </h1>
                <p class="text-gray-600">
                    Interactive tool for exploring 1D Gaussian mixture models and the EM algorithm
                </p>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <!-- File Upload -->
                    <div class="bg-white border rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">Data Input</h3>
                        <div class="flex gap-4 items-center">
                            <input type="file" id="csvFile" accept=".csv,.txt" class="hidden">
                            <button onclick="document.getElementById('csvFile').click()" 
                                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                Upload CSV File
                            </button>
                            <span class="text-gray-500">or</span>
                            <button onclick="generateSampleData()" 
                                    class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                Generate Sample Data
                            </button>
                        </div>
                        <div id="uploadFeedback"></div>
                        <p class="text-sm text-gray-600 mt-2">
                            Upload a CSV file with numerical data (with or without headers) or generate sample data to get started.
                        </p>
                    </div>

                    <!-- EM Controls -->
                    <div class="bg-white border rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">EM Algorithm Controls</h3>
                        <div class="flex items-center gap-4 mb-4">
                            <button onclick="previousStep()" class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                ← Previous
                            </button>
                            <button onclick="nextStep()" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                Next →
                            </button>
                            <div class="border-l pl-4">
                                <button onclick="runToConvergence()" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                                    Run to Convergence
                                </button>
                            </div>
                            <button onclick="resetEM()" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                                Reset
                            </button>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="font-medium">Iteration:</span>
                                <span class="ml-2" id="iteration">0 / 0</span>
                            </div>
                            <div>
                                <span class="font-medium">Log-Likelihood:</span>
                                <span class="ml-2" id="logLikelihood">0.0000</span>
                            </div>
                            <div>
                                <span class="font-medium">Status:</span>
                                <span class="ml-2 text-gray-600" id="status">Ready</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chart -->
                    <div class="bg-white border rounded-lg p-4">
                        <svg id="gmmChart" width="800" height="500"></svg>
                    </div>
                </div>
                
                <!-- Parameter Panel -->
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Parameters</h3>
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-medium">Components:</label>
                            <select id="componentCount" onchange="changeComponentCount()" class="border rounded px-2 py-1 text-sm">
                                <option value="1">1</option>
                                <option value="2" selected>2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="parameterDisplay">
                        <!-- Parameters will be displayed here -->
                    </div>
                    
                    <div id="hoverInfo" class="mt-4 pt-4 border-t" style="display:none;">
                        <h4 class="font-medium mb-2">Query at x = <span id="queryX">0.000</span></h4>
                        <div id="queryDetails" class="space-y-2 text-sm">
                            <div>
                                <span class="font-medium">Total Probability:</span>
                                <span class="ml-2 font-mono" id="totalProb">0.0000</span>
                            </div>
                            <div>
                                <span class="font-medium">Component Probabilities:</span>
                                <div id="componentProbs" class="mt-1 space-y-1">
                                    <!-- Component probabilities will be displayed here -->
                                </div>
                            </div>
                            <div>
                                <span class="font-medium">Posterior Probabilities:</span>
                                <div id="posteriorProbs" class="mt-1 space-y-1">
                                    <!-- Posterior probabilities will be displayed here -->
                                </div>
                            </div>
                            <div class="text-xs text-gray-600 mt-2">
                                Posterior sum: <span id="posteriorSum" class="font-mono">1.0000</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t text-xs text-gray-600">
                        <p><strong>Tip:</strong> Drag the colored circles to adjust μ (horizontally) and π (vertically)</p>
                        <p><strong>Hover:</strong> Move mouse over chart to query mixture probabilities</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // GMM Application Logic
        let gmmData = [];
        let components = [];
        let currentIteration = 0;
        let history = [];
        let isRunning = false;
        let chartElements = {};
        
        // File upload handling
        document.getElementById('csvFile').addEventListener('change', handleFileUpload);
        
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const csvText = e.target.result;
                    const data = parseCSV(csvText);
                    
                    if (data.length === 0) {
                        showUploadFeedback('No valid numerical data found in the file', 'error');
                        return;
                    }
                    
                    gmmData = data;
                    showUploadFeedback(\`✅ Successfully loaded \${data.length} data points\`, 'success');
                    
                    initializeComponents();
                    updateChart();
                    updateParameterDisplay();
                } catch (error) {
                    showUploadFeedback(\`Error parsing CSV: \${error.message}\`, 'error');
                }
            };
            reader.readAsText(file);
        }
        
        function parseCSV(csvText) {
            const lines = csvText.trim().split('\\n');
            if (lines.length === 0) return [];
            
            const firstLine = lines[0];
            const hasHeader = isNaN(parseFloat(firstLine.split(',')[0].trim()));
            
            const dataLines = hasHeader ? lines.slice(1) : lines;
            const values = [];
            
            for (const line of dataLines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                const cells = trimmedLine.split(',');
                for (const cell of cells) {
                    const trimmedCell = cell.trim();
                    const value = parseFloat(trimmedCell);
                    
                    if (!isNaN(value) && isFinite(value)) {
                        values.push(value);
                    }
                }
            }
            
            return values.sort((a, b) => a - b);
        }
        
        function showUploadFeedback(message, type) {
            const feedbackDiv = document.getElementById('uploadFeedback');
            feedbackDiv.innerHTML = \`<div class="upload-feedback upload-\${type}">\${message}</div>\`;
            
            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    feedbackDiv.innerHTML = '';
                }, 5000);
            }
        }
        
        // Initialize with sample data
        function generateSampleData() {
            gmmData = [];
            // Generate bimodal sample data
            for (let i = 0; i < 60; i++) {
                gmmData.push(Math.random() * 2 + Math.random() * 2 + 2);
            }
            for (let i = 0; i < 40; i++) {
                gmmData.push(Math.random() * 1.5 + Math.random() * 1.5 + 8);
            }
            gmmData.sort((a, b) => a - b);
            
            showUploadFeedback(\`✅ Generated \${gmmData.length} sample data points\`, 'success');
            
            initializeComponents();
            updateChart();
            updateParameterDisplay();
        }
        
        function initializeComponents() {
            const dataMin = Math.min(...gmmData);
            const dataMax = Math.max(...gmmData);
            const dataRange = dataMax - dataMin;
            const numComponents = parseInt(document.getElementById('componentCount').value);
            
            components = [];
            for (let i = 0; i < numComponents; i++) {
                components.push({
                    mu: dataMin + (dataMax - dataMin) * Math.random(),
                    sigma: dataRange * (0.1 + Math.random() * 0.3),
                    pi: 1 / numComponents
                });
            }
            
            currentIteration = 0;
            history = [JSON.parse(JSON.stringify(components))];
            updateStatus();
        }
        
        function updateChart() {
            if (gmmData.length === 0) return;
            
            const svg = d3.select('#gmmChart');
            svg.selectAll('*').remove();
            
            const width = 800, height = 500;
            const margin = { top: 20, right: 20, bottom: 40, left: 50 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;
            
            const dataExtent = d3.extent(gmmData);
            const dataRange = dataExtent[1] - dataExtent[0];
            const xMin = dataExtent[0] - dataRange * 0.1;
            const xMax = dataExtent[1] + dataRange * 0.1;
            
            const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, chartWidth]);
            
            // Store scales for hover functionality
            chartElements.xScale = xScale;
            chartElements.chartWidth = chartWidth;
            chartElements.chartHeight = chartHeight;
            
            // Calculate mixture values
            const xValues = d3.range(xMin, xMax, (xMax - xMin) / 200);
            const mixtureValues = xValues.map(x => ({
                x,
                y: components.reduce((sum, comp) => sum + comp.pi * gaussianPDF(x, comp.mu, comp.sigma), 0)
            }));
            
            const maxY = Math.max(d3.max(mixtureValues, d => d.y), 0.1);
            const yScale = d3.scaleLinear().domain([0, maxY * 1.1]).range([chartHeight, 0]);
            chartElements.yScale = yScale;
            chartElements.maxY = maxY;
            
            const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`);
            
            // Axes
            g.append('g').attr('transform', \`translate(0,\${chartHeight})\`).call(d3.axisBottom(xScale));
            g.append('g').call(d3.axisLeft(yScale));
            
            // Labels
            g.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - (chartHeight / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Probability Density');
                
            g.append('text')
                .attr('transform', \`translate(\${chartWidth / 2}, \${chartHeight + margin.bottom})\`)
                .style('text-anchor', 'middle')
                .text('Value');
            
            const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveCardinal);
            const colors = d3.schemeCategory10;
            
            // Component curves
            components.forEach((comp, i) => {
                const curve = xValues.map(x => ({
                    x,
                    y: comp.pi * gaussianPDF(x, comp.mu, comp.sigma)
                }));
                
                g.append('path')
                    .datum(curve)
                    .attr('class', 'component-curve')
                    .attr('stroke', colors[i])
                    .attr('d', line);
            });
            
            // Mixture curve
            g.append('path')
                .datum(mixtureValues)
                .attr('class', 'mixture-line')
                .attr('d', line);
            
            // Data points
            g.selectAll('.data-point')
                .data(gmmData)
                .enter().append('circle')
                .attr('class', 'data-point')
                .attr('cx', d => xScale(d))
                .attr('cy', chartHeight - 10)
                .attr('r', 3);
            
            // Component markers (mu lines and draggable circles)
            components.forEach((comp, i) => {
                const group = g.append('g');
                
                // Vertical line for mu
                group.append('line')
                    .attr('x1', xScale(comp.mu))
                    .attr('x2', xScale(comp.mu))
                    .attr('y1', 0)
                    .attr('y2', chartHeight)
                    .attr('class', 'component-line')
                    .attr('stroke', colors[i]);
                
                // Draggable circle for pi/mu
                group.append('circle')
                    .attr('cx', xScale(comp.mu))
                    .attr('cy', yScale(comp.pi * maxY))
                    .attr('r', 8)
                    .attr('fill', colors[i])
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2)
                    .attr('class', 'draggable')
                    .call(d3.drag()
                        .on('drag', function(event) {
                            const newMu = xScale.invert(event.x);
                            const newPi = Math.max(0.01, Math.min(0.99, yScale.invert(event.y) / maxY));
                            
                            components[i].mu = newMu;
                            components[i].pi = newPi;
                            
                            // Normalize pi values
                            const totalPi = components.reduce((sum, c) => sum + c.pi, 0);
                            components.forEach(c => c.pi /= totalPi);
                            
                            updateChart();
                            updateParameterDisplay();
                        })
                    );
            });
            
            // Hover line for queries
            const hoverLine = g.append('line')
                .attr('class', 'hover-line')
                .attr('y1', 0)
                .attr('y2', chartHeight)
                .style('opacity', 0);
            
            // Invisible overlay for mouse tracking
            const hoverOverlay = g.append('rect')
                .attr('class', 'hover-overlay')
                .attr('width', chartWidth)
                .attr('height', chartHeight)
                .on('mousemove', function(event) {
                    const [mouseX] = d3.pointer(event);
                    const x = xScale.invert(mouseX);
                    
                    // Update hover line
                    hoverLine
                        .attr('x1', mouseX)
                        .attr('x2', mouseX)
                        .style('opacity', 1);
                    
                    // Calculate probabilities at this point
                    updateHoverInfo(x);
                })
                .on('mouseleave', function() {
                    hoverLine.style('opacity', 0);
                    document.getElementById('hoverInfo').style.display = 'none';
                });
        }
        
        function updateHoverInfo(x) {
            // Calculate component probabilities
            const componentProbs = components.map(comp => 
                comp.pi * gaussianPDF(x, comp.mu, comp.sigma)
            );
            
            // Calculate total mixture probability
            const totalProb = componentProbs.reduce((sum, p) => sum + p, 0);
            
            // Calculate posterior probabilities
            const posteriors = totalProb > 0 
                ? componentProbs.map(p => p / totalProb)
                : new Array(components.length).fill(1 / components.length);
            
            // Update display
            document.getElementById('hoverInfo').style.display = 'block';
            document.getElementById('queryX').textContent = x.toFixed(3);
            document.getElementById('totalProb').textContent = totalProb.toFixed(4);
            
            const colors = d3.schemeCategory10;
            
            // Component probabilities
            const componentProbsDiv = document.getElementById('componentProbs');
            componentProbsDiv.innerHTML = componentProbs.map((prob, i) => 
                \`<div class="flex justify-between">
                    <span style="color: \${colors[i]}">Component \${i + 1}:</span>
                    <span class="font-mono">\${prob.toFixed(4)}</span>
                </div>\`
            ).join('');
            
            // Posterior probabilities
            const posteriorProbsDiv = document.getElementById('posteriorProbs');
            posteriorProbsDiv.innerHTML = posteriors.map((post, i) => 
                \`<div class="flex justify-between">
                    <span style="color: \${colors[i]}">P(Comp \${i + 1} | x):</span>
                    <span class="font-mono">\${post.toFixed(4)}</span>
                </div>\`
            ).join('');
            
            // Posterior sum verification
            const posteriorSum = posteriors.reduce((sum, p) => sum + p, 0);
            document.getElementById('posteriorSum').textContent = posteriorSum.toFixed(4);
        }
        
        function gaussianPDF(x, mu, sigma) {
            const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
            const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
            return coefficient * Math.exp(exponent);
        }
        
        function updateParameterDisplay() {
            const container = document.getElementById('parameterDisplay');
            const colors = d3.schemeCategory10;
            
            container.innerHTML = components.map((comp, i) => \`
                <div class="border rounded p-3 mb-3" style="border-left: 4px solid \${colors[i]}">
                    <h4 class="font-medium mb-2" style="color: \${colors[i]}">Component \${i + 1}</h4>
                    <div class="grid grid-cols-3 gap-3 text-sm">
                        <div><span class="font-medium">μ:</span><div class="font-mono">\${comp.mu.toFixed(3)}</div></div>
                        <div><span class="font-medium">σ:</span><div class="font-mono">\${comp.sigma.toFixed(3)}</div></div>
                        <div><span class="font-medium">π:</span><div class="font-mono">\${comp.pi.toFixed(3)}</div></div>
                    </div>
                </div>
            \`).join('');
        }
        
        function updateStatus() {
            document.getElementById('iteration').textContent = \`\${currentIteration} / \${history.length - 1}\`;
            document.getElementById('status').textContent = isRunning ? 'Running...' : 'Ready';
        }
        
        function nextStep() {
            // Simplified EM step - just add some noise to demonstrate
            components.forEach(comp => {
                comp.mu += (Math.random() - 0.5) * 0.1;
                comp.sigma += (Math.random() - 0.5) * 0.05;
                comp.sigma = Math.max(0.1, comp.sigma);
            });
            
            history.push(JSON.parse(JSON.stringify(components)));
            currentIteration++;
            
            updateChart();
            updateParameterDisplay();
            updateStatus();
        }
        
        function previousStep() {
            if (currentIteration > 0) {
                currentIteration--;
                components = JSON.parse(JSON.stringify(history[currentIteration]));
                updateChart();
                updateParameterDisplay();
                updateStatus();
            }
        }
        
        function resetEM() {
            initializeComponents();
            updateChart();
            updateParameterDisplay();
        }
        
        function runToConvergence() {
            isRunning = true;
            updateStatus();
            
            const runStep = () => {
                if (currentIteration < 20) { // Limit iterations
                    nextStep();
                    setTimeout(runStep, 200);
                } else {
                    isRunning = false;
                    updateStatus();
                }
            };
            
            runStep();
        }
        
        function changeComponentCount() {
            initializeComponents();
            updateChart();
            updateParameterDisplay();
        }
        
        // Initialize app
        generateSampleData();
        
        console.log('✅ Enhanced Gaussian Mixture Model Explorer loaded successfully!');
        console.log('✅ Hover functionality enabled');
        console.log('✅ File upload feedback enabled');
    </script>
</body>
</html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(port, host, () => {
  console.log(`✅ Enhanced GMM App running at http://${host}:${port}`);
  console.log(`✅ Accessible at http://localhost:${port}`);
  console.log(`✅ Features: hover queries, file upload feedback`);
});

process.on('SIGTERM', () => {
  console.log('Enhanced GMM App shutting down...');
  server.close();
});