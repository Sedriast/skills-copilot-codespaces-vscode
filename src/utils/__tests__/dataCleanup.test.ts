import { cleanCSVData, validateCSVFile, getDataStatistics } from '../dataCleanup';
import { CSVData, DataCleaningOptions } from '@/types';

describe('Data Cleanup Utilities', () => {
  const sampleCSVData: CSVData = {
    headers: ['name', 'age', 'date', 'score'],
    rows: [
      ['John Doe', 25, '2023-01-15', 85.5],
      ['Jane Smith', 30, '01/20/2023', 92.0],
      ['John Doe', 25, '2023-01-15', 85.5], // Duplicate
      ['Bob Johnson', null, '2023-02-10', 78.3],
      ['Alice Brown', 28, '', 95.2], // Missing date
      [' Tom Wilson ', 35, '2023-03-01', null], // Missing score, whitespace
    ],
    originalSize: 6,
  };

  describe('cleanCSVData', () => {
    it('should remove duplicates when option is enabled', () => {
      const options: DataCleaningOptions = {
        removeDuplicates: true,
        handleMissingValues: false,
        standardizeDates: false,
        trimWhitespace: false,
      };

      const { cleanedData, result } = cleanCSVData(sampleCSVData, options);

      expect(result.duplicatesRemoved).toBe(1);
      expect(cleanedData.rows).toHaveLength(5);
      expect(result.cleanedRowCount).toBe(5);
    });

    it('should handle missing values when option is enabled', () => {
      const options: DataCleaningOptions = {
        removeDuplicates: false,
        handleMissingValues: true,
        standardizeDates: false,
        trimWhitespace: false,
      };

      const { cleanedData, result } = cleanCSVData(sampleCSVData, options);

      expect(result.missingValuesHandled).toBeGreaterThan(0);
      
      // Check that null values are replaced
      const bobRow = cleanedData.rows.find(row => row[0] === 'Bob Johnson');
      expect(bobRow).toBeDefined();
      expect(bobRow![1]).not.toBeNull();
    });

    it('should standardize dates when option is enabled', () => {
      const options: DataCleaningOptions = {
        removeDuplicates: false,
        handleMissingValues: false,
        standardizeDates: true,
        trimWhitespace: false,
      };

      const { cleanedData, result } = cleanCSVData(sampleCSVData, options);

      expect(result.datesStandardized).toBeGreaterThan(0);
      
      // Check that MM/DD/YYYY is converted to YYYY-MM-DD
      const janeRow = cleanedData.rows.find(row => row[0] === 'Jane Smith');
      expect(janeRow).toBeDefined();
      expect(janeRow![2]).toBe('2023-01-20');
    });

    it('should trim whitespace when option is enabled', () => {
      const options: DataCleaningOptions = {
        removeDuplicates: false,
        handleMissingValues: false,
        standardizeDates: false,
        trimWhitespace: true,
      };

      const { cleanedData } = cleanCSVData(sampleCSVData, options);

      const tomRow = cleanedData.rows.find(row => 
        typeof row[0] === 'string' && row[0].includes('Tom Wilson')
      );
      expect(tomRow).toBeDefined();
      expect(tomRow![0]).toBe('Tom Wilson');
    });
  });

  describe('validateCSVFile', () => {
    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'large.csv', {
        type: 'text/csv',
      });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11MB

      const result = validateCSVFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the 10MB limit');
    });

    it('should accept valid CSV files', () => {
      const validFile = new File(['name,age\nJohn,25'], 'data.csv', {
        type: 'text/csv',
      });

      const result = validateCSVFile(validFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid file formats', () => {
      const invalidFile = new File([''], 'document.pdf', {
        type: 'application/pdf',
      });

      const result = validateCSVFile(invalidFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });
  });

  describe('getDataStatistics', () => {
    it('should calculate correct statistics', () => {
      const stats = getDataStatistics(sampleCSVData);

      expect(stats.totalRows).toBe(6);
      expect(stats.totalColumns).toBe(4);
      expect(stats.columnsWithMissingData).toBeGreaterThan(0);
      expect(stats.numericColumns).toBeGreaterThan(0);
      expect(stats.dateColumns).toBeGreaterThan(0);
    });

    it('should identify empty rows', () => {
      const dataWithEmptyRow: CSVData = {
        headers: ['col1', 'col2'],
        rows: [
          ['value1', 'value2'],
          [null, null],
          ['', ''],
          ['value3', 'value4'],
        ],
        originalSize: 4,
      };

      const stats = getDataStatistics(dataWithEmptyRow);

      expect(stats.emptyRows).toBe(2);
    });
  });
});