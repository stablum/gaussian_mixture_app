export function parseCSV(csvText: string): number[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const hasHeader = isNaN(parseFloat(firstLine.split(',')[0].trim()));
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const values: number[] = [];

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

  return values;
}

export function generateSampleData(n: number = 100): number[] {
  const data: number[] = [];
  
  const n1 = Math.floor(n * 0.6);
  const n2 = n - n1;
  
  for (let i = 0; i < n1; i++) {
    data.push(Math.random() * 2 + Math.random() * 2 + 2);
  }
  
  for (let i = 0; i < n2; i++) {
    data.push(Math.random() * 1.5 + Math.random() * 1.5 + 8);
  }
  
  return data.sort((a, b) => a - b);
}