import styles from './page.module.css';

export default function Home() {
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
        <div className={styles.uploadSection}>
          <h2>Upload Your Data</h2>
          <p>Upload your CSV file (max 10 MB) to get started with your business intelligence dashboard.</p>
          <div className={styles.uploadArea}>
            <div className={styles.uploadPlaceholder}>
              <div className={styles.uploadIcon}>📊</div>
              <p>Drag and drop your CSV file here, or click to browse</p>
              <small>Maximum file size: 10 MB</small>
            </div>
          </div>
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
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 PymeReports - Built with Next.js</p>
      </footer>
    </div>
  );
}
