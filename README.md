# Gaussian Mixture Model Explorer

An interactive educational tool for exploring 1D Gaussian mixture models and the Expectation-Maximization (EM) algorithm.

## Features

- **Interactive Visualization**: Real-time probability density plotting with draggable Gaussian components
- **EM Algorithm Controls**: Step-by-step iteration or auto-run to convergence
- **Data Input**: Upload CSV files or generate sample data
- **Parameter Manipulation**: Drag components to adjust μ (mean) and π (weight) parameters
- **Query Mode**: Hover over the chart to see probability values and posterior probabilities
- **Educational Focus**: Designed to help students understand the interplay between parameters and distributions

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
docker build -t gaussian-mixture-app .
docker run -p 3000:3000 gaussian-mixture-app
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

1. **Load Data**: Upload a CSV file with numerical data or generate sample data
2. **Adjust Components**: Change the number of Gaussian components (1-5)
3. **Manual EM Steps**: Use Previous/Next buttons to step through EM iterations
4. **Auto-Run**: Click "Run to Convergence" to automatically run the EM algorithm
5. **Interactive Manipulation**: Drag the colored circles to adjust component parameters
6. **Query Mode**: Hover over the chart to see probability calculations at any point

## Technical Details

- **Framework**: Next.js with TypeScript
- **Visualization**: D3.js for interactive charts
- **Styling**: Tailwind CSS
- **Mathematics**: Custom GMM implementation with proper EM algorithm
- **Export**: Static site generation for easy deployment

## Educational Value

This tool is designed for students learning about:
- Gaussian mixture models
- Expectation-Maximization algorithm
- Parameter estimation
- Probability density functions
- Bayesian inference (posterior probabilities)

The interactive nature allows students to see how parameter changes affect the overall mixture distribution and understand the convergence process of the EM algorithm.