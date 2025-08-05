// Mock D3.js for Jest testing
const mockSelection = {
  append: jest.fn(() => mockSelection),
  attr: jest.fn(() => mockSelection),
  style: jest.fn(() => mockSelection),
  text: jest.fn(() => mockSelection),
  html: jest.fn(() => mockSelection),
  classed: jest.fn(() => mockSelection),
  data: jest.fn(() => mockSelection),
  enter: jest.fn(() => mockSelection),
  exit: jest.fn(() => mockSelection),
  remove: jest.fn(() => mockSelection),
  merge: jest.fn(() => mockSelection),
  selectAll: jest.fn(() => mockSelection),
  select: jest.fn(() => mockSelection),
  on: jest.fn(() => mockSelection),
  call: jest.fn(() => mockSelection),
  transition: jest.fn(() => mockSelection),
  duration: jest.fn(() => mockSelection),
  ease: jest.fn(() => mockSelection),
  node: jest.fn(() => ({ getBoundingClientRect: () => ({ width: 800, height: 600 }) })),
  nodes: jest.fn(() => []),
  datum: jest.fn(() => mockSelection),
  each: jest.fn(() => mockSelection),
  filter: jest.fn(() => mockSelection),
  sort: jest.fn(() => mockSelection),
  order: jest.fn(() => mockSelection),
  raise: jest.fn(() => mockSelection),
  lower: jest.fn(() => mockSelection),
};

const mockScale = {
  domain: jest.fn(() => mockScale),
  range: jest.fn(() => mockScale),
  bandwidth: jest.fn(() => 10),
  paddingInner: jest.fn(() => mockScale),
  paddingOuter: jest.fn(() => mockScale),
  copy: jest.fn(() => mockScale),
  invert: jest.fn((x) => x),
  ticks: jest.fn(() => [0, 1, 2, 3, 4, 5]),
  tickFormat: jest.fn(() => (d) => String(d)),
  nice: jest.fn(() => mockScale),
  clamp: jest.fn(() => mockScale),
};

const mockAxis = {
  scale: jest.fn(() => mockAxis),
  orient: jest.fn(() => mockAxis),
  ticks: jest.fn(() => mockAxis),
  tickSize: jest.fn(() => mockAxis),
  tickFormat: jest.fn(() => mockAxis),
  tickValues: jest.fn(() => mockAxis),
  tickSizeInner: jest.fn(() => mockAxis),
  tickSizeOuter: jest.fn(() => mockAxis),
  tickPadding: jest.fn(() => mockAxis),
};

const mockDrag = {
  subject: jest.fn(() => mockDrag),
  on: jest.fn(() => mockDrag),
  container: jest.fn(() => mockDrag),
  filter: jest.fn(() => mockDrag),
  touchable: jest.fn(() => mockDrag),
  clickDistance: jest.fn(() => mockDrag),
};

const mockLine = {
  x: jest.fn(() => mockLine),
  y: jest.fn(() => mockLine),
  curve: jest.fn(() => mockLine),
  defined: jest.fn(() => mockLine),
  context: jest.fn(() => mockLine),
};

// Mock scale functions that return values
const mockScaleLinear = jest.fn((x) => typeof x === 'number' ? x * 10 : 0);
Object.assign(mockScaleLinear, mockScale);

const mockScaleBand = jest.fn((x) => typeof x === 'string' ? x.length * 10 : 0);
Object.assign(mockScaleBand, mockScale);

const select = jest.fn(() => mockSelection);
const selectAll = jest.fn(() => mockSelection);

const scaleLinear = jest.fn(() => mockScaleLinear);
const scaleBand = jest.fn(() => mockScaleBand);
const scaleOrdinal = jest.fn(() => mockScale);
const scaleTime = jest.fn(() => mockScale);

const axisBottom = jest.fn(() => mockAxis);
const axisLeft = jest.fn(() => mockAxis);
const axisRight = jest.fn(() => mockAxis);
const axisTop = jest.fn(() => mockAxis);

const drag = jest.fn(() => mockDrag);

const line = jest.fn(() => mockLine);
const area = jest.fn(() => mockLine);
const arc = jest.fn(() => mockLine);

const extent = jest.fn((data, accessor) => {
  if (!data || data.length === 0) return [0, 1];
  if (accessor) {
    const values = data.map(accessor).filter(d => d != null && !isNaN(d));
    return values.length > 0 ? [Math.min(...values), Math.max(...values)] : [0, 1];
  }
  const values = data.filter(d => d != null && !isNaN(d));
  return values.length > 0 ? [Math.min(...values), Math.max(...values)] : [0, 1];
});

const max = jest.fn((data, accessor) => {
  if (!data || data.length === 0) return 0;
  if (accessor) {
    const values = data.map(accessor).filter(d => d != null && !isNaN(d));
    return values.length > 0 ? Math.max(...values) : 0;
  }
  const values = data.filter(d => d != null && !isNaN(d));
  return values.length > 0 ? Math.max(...values) : 0;
});

const min = jest.fn((data, accessor) => {
  if (!data || data.length === 0) return 0;
  if (accessor) {
    const values = data.map(accessor).filter(d => d != null && !isNaN(d));
    return values.length > 0 ? Math.min(...values) : 0;
  }
  const values = data.filter(d => d != null && !isNaN(d));
  return values.length > 0 ? Math.min(...values) : 0;
});

const range = jest.fn((start, stop, step = 1) => {
  const result = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      result.push(i);
    }
  }
  return result;
});

const format = jest.fn(() => (d) => String(d));

const curveMonotoneX = 'curveMonotoneX';
const curveLinear = 'curveLinear';
const curveBasis = 'curveBasis';

const easeLinear = 'linear';
const easeCubic = 'cubic';

const schemeCategory10 = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

const interpolateViridis = jest.fn((t) => `hsl(${t * 360}, 50%, 50%)`);

const pointer = jest.fn(() => [0, 0]);

const event = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  subject: {},
  sourceEvent: {},
};

// CommonJS exports
module.exports = {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  scaleOrdinal,
  scaleTime,
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  drag,
  line,
  area,
  arc,
  extent,
  max,
  min,
  range,
  format,
  curveMonotoneX,
  curveLinear,
  curveBasis,
  easeLinear,
  easeCubic,
  schemeCategory10,
  interpolateViridis,
  pointer,
  event,
  // Named exports for ES modules compatibility
  __esModule: true,
  default: {
    select,
    selectAll,
    scaleLinear,
    scaleBand,
    scaleOrdinal,
    scaleTime,
    axisBottom,
    axisLeft,
    axisRight,
    axisTop,
    drag,
    line,
    area,
    arc,
    extent,
    max,
    min,
    range,
    format,
    curveMonotoneX,
    curveLinear,
    curveBasis,
    easeLinear,
    easeCubic,
    schemeCategory10,
    interpolateViridis,
    pointer,
    event,
  }
};