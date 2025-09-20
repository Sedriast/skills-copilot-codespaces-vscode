import { CSVData, DataCleaningOptions, DataCleaningResult } from '@/types';

/**
 * Clean and normalize CSV data based on provided options
 */
export function cleanCSVData(
  data: CSVData, 
  options: DataCleaningOptions
): { cleanedData: CSVData; result: DataCleaningResult } {
  const result: DataCleaningResult = {
    originalRowCount: data.rows.length,
    cleanedRowCount: 0,
    duplicatesRemoved: 0,
    missingValuesHandled: 0,
    datesStandardized: 0,
    issues: [],
  };

  let cleanedRows = [...data.rows];
  
  // Remove duplicates
  if (options.removeDuplicates) {
    const uniqueRows = new Set();
    const filteredRows = cleanedRows.filter((row) => {
      const rowKey = JSON.stringify(row);
      if (uniqueRows.has(rowKey)) {
        result.duplicatesRemoved++;
        return false;
      }
      uniqueRows.add(rowKey);
      return true;
    });
    cleanedRows = filteredRows;
  }

  // Handle missing values
  if (options.handleMissingValues) {
    cleanedRows = cleanedRows.map((row) => {
      return row.map((cell, index) => {
        if (cell === null || cell === undefined || cell === '') {
          result.missingValuesHandled++;
          
          // Determine column type and provide appropriate default
          const columnData = cleanedRows.map(r => r[index]).filter(Boolean);
          if (columnData.some(val => !isNaN(Number(val)))) {
            return 0; // Numeric column
          }
          return 'N/A'; // Text column
        }
        return cell;
      });
    });
  }

  // Standardize dates
  if (options.standardizeDates) {
    cleanedRows = cleanedRows.map((row) => {
      return row.map((cell) => {
        if (typeof cell === 'string' && isDateString(cell)) {
          const standardized = standardizeDate(cell);
          if (standardized !== cell) {
            result.datesStandardized++;
            return standardized;
          }
        }
        return cell;
      });
    });
  }

  // Trim whitespace
  if (options.trimWhitespace) {
    cleanedRows = cleanedRows.map((row) => {
      return row.map((cell) => {
        return typeof cell === 'string' ? cell.trim() : cell;
      });
    });
  }

  result.cleanedRowCount = cleanedRows.length;

  const cleanedData: CSVData = {
    ...data,
    rows: cleanedRows,
    cleanedSize: cleanedRows.length,
  };

  return { cleanedData, result };
}

/**
 * Check if a string represents a date
 */
function isDateString(value: string): boolean {
  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
  ];

  return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
}

/**
 * Standardize date format to YYYY-MM-DD
 */
function standardizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return dateString; // Return original if any error occurs
  }
}

/**
 * Validate CSV file size and format
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file size (10 MB limit)
  const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds the 10MB limit`,
    };
  }

  // Check file type
  const validTypes = ['text/csv', 'application/vnd.ms-excel'];
  const validExtensions = ['.csv', '.txt'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a CSV file.',
    };
  }

  return { valid: true };
}

/**
 * Get basic statistics about the data
 */
export function getDataStatistics(data: CSVData) {
  const stats = {
    totalRows: data.rows.length,
    totalColumns: data.headers.length,
    emptyRows: 0,
    columnsWithMissingData: 0,
    numericColumns: 0,
    dateColumns: 0,
  };

  // Count empty rows
  stats.emptyRows = data.rows.filter(row => 
    row.every(cell => cell === null || cell === undefined || cell === '')
  ).length;

  // Analyze columns
  data.headers.forEach((header, index) => {
    const columnData = data.rows.map(row => row[index]).filter(cell => 
      cell !== null && cell !== undefined && cell !== ''
    );

    // Check if column has missing data
    if (columnData.length < data.rows.length) {
      stats.columnsWithMissingData++;
    }

    // Check if column is numeric
    if (columnData.length > 0 && columnData.every(val => !isNaN(Number(val)))) {
      stats.numericColumns++;
    }

    // Check if column contains dates
    if (columnData.length > 0 && 
        columnData.some(val => typeof val === 'string' && isDateString(val))) {
      stats.dateColumns++;
    }
  });

  return stats;
}