'use client';

import { useState } from 'react';
import styles from './page.module.css';
import CSVUpload from '@/components/data/CSVUpload';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Dashboard from '@/components/dashboard/Dashboard';
import { CSVData, UploadError, DataCleaningResult } from '@/types';

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [cleaningResult, setCleaningResult] = useState<DataCleaningResult | null>(null);

  const handleDataUploaded = (data: CSVData) => {
    setCsvData(data);
    setUploadError(null);
    console.log('Data uploaded successfully:', data);
  };

  const handleUploadError = (error: UploadError) => {
    setUploadError(error);
    setCsvData(null);
    console.error('Upload error:', error);
  };

  const handleDataCleaned = (cleanedData: CSVData, result: DataCleaningResult) => {
    setCleaningResult(result);
  };

  const handleRetry = () => {
    setUploadError(null);
    setCsvData(null);
    setCleaningResult(null);
  };

  const handleDismiss = () => {
    setUploadError(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          PymeReports
        </h1>
        <p className={styles.subtitle}>
          Business Intelligence for SMEs - Upload CSV, Generate Reports
        </p>
      </header>

      <main className={styles.main}>
        {!csvData ? (
          <>
            <div className={styles.uploadSection}>
              <h2>Upload Your Data</h2>
              <p>Upload your CSV file (max 10 MB) to get started with your business intelligence dashboard.</p>
              
              {uploadError && (
                <ErrorDisplay 
                  error={uploadError} 
                  onRetry={handleRetry}
                  onDismiss={handleDismiss}
                />
              )}
              
              <CSVUpload 
                onDataUploaded={handleDataUploaded}
                onError={handleUploadError}
                disabled={false}
              />
            </div>

            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>📈 Data Visualization</h3>
                <p>Interactive charts and graphs to visualize your business data</p>
              </div>
              <div className={styles.feature}>
                <h3>🧹 Data Cleaning</h3>
                <p>Automatic detection and cleaning of duplicates, missing values, and date formats</p>
              </div>
              <div className={styles.feature}>
                <h3>📄 PDF Reports</h3>
                <p>Export professional PDF reports with executive summaries and visualizations</p>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.dashboardSection}>
            <div className={styles.dashboardHeader}>
              <div className={styles.dataSummary}>
                <h2>Data Successfully Loaded</h2>
                <div className={styles.dataStats}>
                  <div className={styles.stat}>
                    <strong>{csvData.rows.length}</strong>
                    <span>Rows</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{csvData.headers.length}</strong>
                    <span>Columns</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{Math.round(csvData.originalSize * 0.001) || '<1'}KB</strong>
                    <span>Size (est.)</span>
                  </div>
                </div>
                <button 
                  className={styles.newUploadButton}
                  onClick={handleRetry}
                >
                  Upload New File
                </button>
              </div>
            </div>

            <Dashboard rawData={csvData} />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 PymeReports - Built with Next.js</p>
      </footer>
    </div>
  );
}
