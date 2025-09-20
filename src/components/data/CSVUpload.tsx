'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { CSVData, UploadError, DataProcessingStatus } from '@/types';
import { validateCSVFile } from '@/utils/dataCleanup';
import styles from './CSVUpload.module.css';

interface CSVUploadProps {
  onDataUploaded: (data: CSVData) => void;
  onError: (error: UploadError) => void;
  disabled?: boolean;
}

export default function CSVUpload({ onDataUploaded, onError, disabled = false }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<DataProcessingStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (step: DataProcessingStatus['step'], progress: number, message: string) => {
    setStatus({ step, progress, message });
  };

  const processFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      updateStatus('uploading', 10, 'Validating file...');

      // Validate file
      const validation = validateCSVFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      updateStatus('parsing', 30, 'Parsing CSV data...');

      // Parse CSV
      Papa.parse(file, {
        complete: (result) => {
          try {
            updateStatus('analyzing', 80, 'Analyzing data structure...');

            if (result.errors.length > 0) {
              console.warn('CSV parsing warnings:', result.errors);
            }

            const data = result.data as string[][];
            
            // Filter out empty rows
            const filteredData = data.filter(row => 
              row.some(cell => cell && cell.trim() !== '')
            );

            if (filteredData.length === 0) {
              throw new Error('The CSV file appears to be empty or contains no valid data.');
            }

            // Extract headers and rows
            const headers = filteredData[0].map(header => header.trim());
            const rows = filteredData.slice(1).map(row => 
              row.map(cell => {
                const trimmed = cell.trim();
                if (trimmed === '') return null;
                
                // Try to parse as number
                const num = Number(trimmed);
                if (!isNaN(num) && isFinite(num)) {
                  return num;
                }
                
                return trimmed;
              })
            );

            const csvData: CSVData = {
              headers,
              rows,
              originalSize: rows.length,
            };

            updateStatus('complete', 100, 'Data processed successfully!');
            
            setTimeout(() => {
              onDataUploaded(csvData);
              setIsProcessing(false);
              setStatus(null);
            }, 500);

          } catch (error) {
            setIsProcessing(false);
            setStatus(null);
            onError({
              code: 'PARSING_ERROR',
              message: error instanceof Error ? error.message : 'Failed to parse CSV data'
            });
          }
        },
        error: (error) => {
          setIsProcessing(false);
          setStatus(null);
          onError({
            code: 'PARSING_ERROR',
            message: `CSV parsing failed: ${error.message}`
          });
        },
        header: false,
        skipEmptyLines: false,
      });

    } catch (error) {
      setIsProcessing(false);
      setStatus(null);
      onError({
        code: 'PARSING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process file'
      });
    }
  }, [onDataUploaded, onError]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.uploadArea} ${
          isDragging ? styles.dragging : ''
        } ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className={styles.hiddenInput}
          disabled={disabled}
        />

        {isProcessing ? (
          <div className={styles.processingContainer}>
            <div className={styles.processingIcon}>⚙️</div>
            <div className={styles.processingText}>
              <h3>Processing Your Data</h3>
              {status && (
                <>
                  <p>{status.message}</p>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <small>{status.progress}% complete</small>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>📊</div>
            <h3>Upload Your CSV File</h3>
            <p>Drag and drop your CSV file here, or click to browse</p>
            <div className={styles.uploadDetails}>
              <div className={styles.supportedFormats}>
                <strong>Supported formats:</strong> .csv, .txt
              </div>
              <div className={styles.sizeLimit}>
                <strong>Maximum size:</strong> 10 MB
              </div>
            </div>
          </div>
        )}
      </div>

      {!isProcessing && (
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🧹</span>
            <span>Automatic data cleaning</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📈</span>
            <span>Interactive visualizations</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📄</span>
            <span>Professional PDF reports</span>
          </div>
        </div>
      )}
    </div>
  );
}