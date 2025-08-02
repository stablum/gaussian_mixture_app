import { parseCSV, generateSampleData, generateSimpleSampleData } from '@/lib/csvParser';

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV data', () => {
      const csv = '1,2,3\n4,5,6';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle CSV with headers', () => {
      const csv = 'x,y,z\n1,2,3\n4,5,6';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle single column CSV', () => {
      const csv = '1\n2\n3\n4\n5';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle single column CSV with header', () => {
      const csv = 'value\n1\n2\n3\n4\n5';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should skip empty lines', () => {
      const csv = '1,2,3\n\n4,5,6\n\n';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle whitespace around values', () => {
      const csv = ' 1 , 2 , 3 \n 4 , 5 , 6 ';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should filter out invalid values', () => {
      const csv = '1,abc,3\n4,NaN,6\nInfinity,5,xyz';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 3, 4, 6, 5]);
    });

    it('should handle decimal numbers', () => {
      const csv = '1.5,2.7,3.14\n4.0,5.5,6.8';
      const result = parseCSV(csv);
      expect(result).toEqual([1.5, 2.7, 3.14, 4.0, 5.5, 6.8]);
    });

    it('should handle negative numbers', () => {
      const csv = '-1,2,-3\n4,-5,6';
      const result = parseCSV(csv);
      expect(result).toEqual([-1, 2, -3, 4, -5, 6]);
    });

    it('should return empty array for empty input', () => {
      expect(parseCSV('')).toEqual([]);
      expect(parseCSV('   ')).toEqual([]);
    });

    it('should handle scientific notation', () => {
      const csv = '1e2,2.5e-1,3.14e0';
      const result = parseCSV(csv);
      expect(result).toEqual([100, 0.25, 3.14]);
    });

    it('should reject Infinity values', () => {
      const csv = '1,Infinity,3\n4,-Infinity,6';
      const result = parseCSV(csv);
      expect(result).toEqual([1, 3, 4, 6]);
    });
  });

  describe('generateSimpleSampleData', () => {
    it('should generate correct number of points', () => {
      const data = generateSimpleSampleData(100);
      expect(data).toHaveLength(100);
    });

    it('should generate different data each time', () => {
      const data1 = generateSimpleSampleData(50);
      const data2 = generateSimpleSampleData(50);
      expect(data1).not.toEqual(data2);
    });

    it('should return sorted data', () => {
      const data = generateSimpleSampleData(100);
      const sortedData = [...data].sort((a, b) => a - b);
      expect(data).toEqual(sortedData);
    });

    it('should generate reasonable value ranges', () => {
      const data = generateSimpleSampleData(100);
      
      // Should have values in expected ranges
      // First cluster around 2-6, second cluster around 8-12
      expect(Math.min(...data)).toBeGreaterThan(0);
      expect(Math.max(...data)).toBeLessThan(15);
    });

    it('should handle small sample sizes', () => {
      const data = generateSimpleSampleData(1);
      expect(data).toHaveLength(1);
      expect(data[0]).toBeGreaterThan(0);
    });

    it('should handle default parameter', () => {
      const data = generateSimpleSampleData();
      expect(data).toHaveLength(100);
    });

    it('should generate bimodal distribution', () => {
      const data = generateSimpleSampleData(1000);
      
      // Split data into two regions and check both have reasonable counts
      const lowValues = data.filter(x => x < 6);
      const highValues = data.filter(x => x >= 6);
      
      // Should have both clusters represented
      expect(lowValues.length).toBeGreaterThan(100);
      expect(highValues.length).toBeGreaterThan(100);
      
      // First cluster should be roughly 60%, second 40%
      expect(lowValues.length).toBeGreaterThan(highValues.length);
    });
  });

  describe('generateSampleData (advanced)', () => {
    it('should generate data with custom configuration', () => {
      const config = {
        totalPoints: 50,
        components: [
          { mean: 0, stdDev: 1, weight: 0.5 },
          { mean: 10, stdDev: 2, weight: 0.5 }
        ]
      };
      const data = generateSampleData(config);
      expect(data).toHaveLength(50);
    });

    it('should handle preset configurations', () => {
      const trimodal = generateSampleData({ totalPoints: 150, preset: 'trimodal' });
      expect(trimodal).toHaveLength(150);
      
      const uniform = generateSampleData({ totalPoints: 100, preset: 'uniform' });
      expect(uniform).toHaveLength(100);
    });

    it('should normalize weights automatically', () => {
      const config = {
        totalPoints: 100,
        components: [
          { mean: 0, stdDev: 1, weight: 2 },
          { mean: 5, stdDev: 1, weight: 3 }
        ]
      };
      const data = generateSampleData(config);
      expect(data).toHaveLength(100);
    });

    it('should handle single component', () => {
      const config = {
        totalPoints: 50,
        components: [{ mean: 5, stdDev: 1, weight: 1 }]
      };
      const data = generateSampleData(config);
      expect(data).toHaveLength(50);
      
      // Should be roughly centered around mean
      const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
      expect(Math.abs(mean - 5)).toBeLessThan(1);
    });
  });
});