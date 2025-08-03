# ML Explorer

An interactive educational tool for exploring machine learning algorithms including Gaussian Mixture Models (GMM) and K-means clustering.

## Features

### Dual Algorithm Support
- **Gaussian Mixture Models**: Complete EM algorithm implementation with interactive parameter adjustment
- **K-means Clustering**: Full k-means algorithm with k-means++ initialization and convergence detection
- **Seamless Mode Switching**: Toggle between algorithms while preserving data and settings

### Interactive Visualization
- **Real-time Charts**: Dynamic probability density plotting and cluster visualization
- **Draggable Parameters**: Adjust means/centroids, weights, and other parameters by dragging
- **Color-coded Components**: Visual distinction between different clusters/components
- **Hover Information**: See probability values, distances, and posterior probabilities

### Algorithm Controls
- **Step-by-step Execution**: Manual iteration through algorithm steps
- **Auto-run to Convergence**: Automatic execution with convergence detection
- **History Navigation**: Move forward/backward through algorithm iterations
- **Reset & Restart**: Easy algorithm reinitialization

### Educational Features
- **Mathematical Formulas**: Complete mathematical formulation for both algorithms
- **Parameter Panels**: Editable parameter inputs with real-time updates
- **Data Input**: Upload CSV files or generate sample datasets
- **Dark/Light Themes**: Comfortable viewing in any lighting condition

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Docker

Build and run with Docker:

```bash
docker build -t ml-explorer .
docker run -p 3000:3000 ml-explorer
```

Or use Docker Compose:

```bash
docker-compose up --build
```

### Deployment

#### Vercel (Recommended)

1. Connect your repository to Vercel
2. Deploy automatically - the `vercel.json` configuration handles the static export

#### Other Static Hosts

Build the static export:

```bash
npm run build
```

Deploy the `out/` directory to any static hosting service (Netlify, GitHub Pages, etc.)

## Usage

### Getting Started
1. **Choose Algorithm**: Switch between GMM and K-means using the mode toggle
2. **Load Data**: Upload a CSV file with numerical data or generate sample data
3. **Adjust Components/Clusters**: Change the number of components (1-5)

### GMM Mode
4. **Manual EM Steps**: Use Previous/Next buttons to step through EM iterations
5. **Auto-Run**: Click "Run to Convergence" to automatically run the EM algorithm
6. **Parameter Adjustment**: Drag circles to adjust μ (mean) and π (weight) parameters
7. **Query Mode**: Hover over the chart to see probability calculations

### K-means Mode
4. **Manual K-means Steps**: Step through centroid updates and cluster assignments
5. **Auto-Run**: Automatically run k-means to convergence
6. **Centroid Adjustment**: Drag handles to manually position cluster centroids
7. **Query Mode**: Hover to see distances to centroids and nearest cluster

## Technical Details

- **Framework**: Next.js 14 with TypeScript
- **Visualization**: D3.js for interactive charts and SVG manipulation
- **Styling**: Tailwind CSS with dark mode support
- **Mathematics**: Custom implementations of GMM (EM algorithm) and K-means with proper convergence detection
- **Architecture**: Modular dual-mode design supporting multiple algorithms
- **Export**: Static site generation for easy deployment

## Educational Value

This tool is designed for students and practitioners learning about:

### Gaussian Mixture Models
- Expectation-Maximization algorithm
- Parameter estimation and convergence
- Probability density functions
- Bayesian inference and posterior probabilities
- Component weight optimization

### K-means Clustering
- Centroid-based clustering
- k-means++ initialization strategies
- Within-cluster sum of squares (WCSS) optimization
- Convergence criteria and iteration limits
- Cluster assignment and boundary formation

### General Machine Learning Concepts
- Algorithm comparison and trade-offs
- Interactive parameter exploration
- Convergence behavior analysis
- Data visualization and interpretation

The interactive nature allows users to develop intuition about how these fundamental algorithms work and how parameter changes affect their behavior and results.