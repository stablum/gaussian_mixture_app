// Shared color scheme for consistent visualization across all components
export const COMPONENT_COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange  
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // olive
  '#17becf'  // cyan
];

export function getComponentColor(index: number): string {
  return COMPONENT_COLORS[index % COMPONENT_COLORS.length];
}