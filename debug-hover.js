// Debug script to test 2D Gaussian hover functionality
// Run this in browser console while on 2D Gaussian mode

console.log('🔍 Starting 2D Gaussian Hover Debug...');

// Function to test hover functionality
function testHover() {
  console.log('1. Checking if we are in 2D mode...');
  const modeText = document.querySelector('button[aria-pressed="true"]')?.textContent;
  console.log('Current mode:', modeText);
  
  console.log('2. Looking for Chart2D SVG...');
  const svgs = document.querySelectorAll('svg');
  console.log(`Found ${svgs.length} SVG elements`);
  
  svgs.forEach((svg, index) => {
    console.log(`SVG ${index}:`, {
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      children: svg.children.length,
      classes: svg.className
    });
  });
  
  console.log('3. Looking for hover rectangles...');
  const hoverRects = document.querySelectorAll('svg rect[pointer-events="all"]');
  console.log(`Found ${hoverRects.length} hover rectangles`);
  
  hoverRects.forEach((rect, index) => {
    console.log(`Hover rect ${index}:`, {
      width: rect.getAttribute('width'),
      height: rect.getAttribute('height'),
      fill: rect.getAttribute('fill'),
      pointerEvents: rect.getAttribute('pointer-events'),
      cursor: rect.style.cursor
    });
  });
  
  console.log('4. Looking for ParameterPanel hover section...');
  const queryTexts = document.querySelectorAll('*');
  const queryElements = Array.from(queryTexts).filter(el => 
    el.textContent && el.textContent.includes('Query')
  );
  console.log(`Found ${queryElements.length} elements containing "Query"`);
  
  queryElements.forEach((el, index) => {
    console.log(`Query element ${index}:`, {
      text: el.textContent?.substring(0, 100),
      tag: el.tagName,
      visible: window.getComputedStyle(el).display !== 'none'
    });
  });
  
  console.log('5. Looking for Probability Density elements...');
  const densityElements = Array.from(queryTexts).filter(el => 
    el.textContent && el.textContent.includes('Probability Density')
  );
  console.log(`Found ${densityElements.length} elements containing "Probability Density"`);
  
  densityElements.forEach((el, index) => {
    console.log(`Density element ${index}:`, {
      text: el.textContent?.substring(0, 100),
      visible: window.getComputedStyle(el).display !== 'none'
    });
  });
  
  // Try to simulate a hover event
  console.log('6. Attempting to simulate hover event...');
  const mainSvg = document.querySelector('svg');
  if (mainSvg) {
    const rect = mainSvg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    console.log(`SVG bounds:`, rect);
    console.log(`Simulating hover at: (${centerX}, ${centerY})`);
    
    // Create and dispatch mouse events
    const mouseEnterEvent = new MouseEvent('mouseenter', {
      clientX: centerX,
      clientY: centerY,
      bubbles: true
    });
    
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: centerX,
      clientY: centerY,
      bubbles: true
    });
    
    mainSvg.dispatchEvent(mouseEnterEvent);
    mainSvg.dispatchEvent(mouseMoveEvent);
    
    setTimeout(() => {
      console.log('7. Checking hover state after simulation...');
      const afterElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Query at')
      );
      console.log(`After hover - found ${afterElements.length} "Query at" elements`);
      
      afterElements.forEach((el, index) => {
        console.log(`Query at element ${index}:`, {
          text: el.textContent?.substring(0, 100)
        });
      });
    }, 1000);
  } else {
    console.log('No SVG found!');
  }
  
  console.log('8. Checking for red hover circle...');
  const redCircles = document.querySelectorAll('circle[fill="red"]');
  console.log(`Found ${redCircles.length} red circles`);
  
  redCircles.forEach((circle, index) => {
    console.log(`Red circle ${index}:`, {
      cx: circle.getAttribute('cx'),
      cy: circle.getAttribute('cy'),
      r: circle.getAttribute('r'),
      opacity: circle.getAttribute('opacity'),
      visible: window.getComputedStyle(circle).display !== 'none'
    });
  });
}

// Run the test
testHover();

// Also setup a live hover monitor
console.log('🎯 Setting up live hover monitor...');
let hoverMonitor;

function startHoverMonitoring() {
  const mainSvg = document.querySelector('svg');
  if (mainSvg) {
    hoverMonitor = setInterval(() => {
      const queryElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Query at (')
      );
      
      if (queryElements.length > 0) {
        console.log('📍 Hover detected:', queryElements[0].textContent);
      }
    }, 500);
    
    console.log('✅ Hover monitor started. Move mouse over the chart to see live updates.');
    console.log('Run stopHoverMonitoring() to stop.');
  } else {
    console.log('❌ No SVG found for hover monitoring');
  }
}

function stopHoverMonitoring() {
  if (hoverMonitor) {
    clearInterval(hoverMonitor);
    console.log('🛑 Hover monitoring stopped');
  }
}

// Auto-start monitoring
startHoverMonitoring();

// Make functions available globally
window.testHover = testHover;
window.startHoverMonitoring = startHoverMonitoring;
window.stopHoverMonitoring = stopHoverMonitoring;

console.log('🚀 Debug tools ready! Available functions:');
console.log('  - testHover(): Run diagnostic test');
console.log('  - startHoverMonitoring(): Start live hover monitoring');
console.log('  - stopHoverMonitoring(): Stop monitoring');