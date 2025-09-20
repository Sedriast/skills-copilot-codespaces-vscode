// Core data types for PymeReports
export interface CSVData {
  headers: string[];
  rows: (string | number | null)[][];
  originalSize: number;
  cleanedSize?: number;
}

export interface DataCleaningOptions {
  removeDuplicates: boolean;
  handleMissingValues: boolean;
  standardizeDates: boolean;
  trimWhitespace: boolean;
}

export interface DataCleaningResult {
  originalRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  missingValuesHandled: number;
  datesStandardized: number;
  issues: string[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  xAxis: string;
  yAxis: string;
  title: string;
  color?: string;
}

export interface PDFReportConfig {
  title: string;
  executiveSummary: string;
  includeCharts: boolean;
  includeTables: boolean;
  maxSize: number; // in MB
}

export interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'PARSING_ERROR' | 'NETWORK_ERROR';
  message: string;
}

export interface DataProcessingStatus {
  step: 'uploading' | 'parsing' | 'cleaning' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface FilterOption {
  column: string;
  value: string | number;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
}

export interface TableFilter {
  searchTerm: string;
  columnFilters: FilterOption[];
  sortColumn?: string;
  sortDirection: 'asc' | 'desc';
}