'use client';

import { useState, useMemo, useEffect } from 'react';
import { CSVData, ChartConfig, DataCleaningOptions, DataCleaningResult } from '@/types';
import { cleanCSVData, getDataStatistics } from '@/utils/dataCleanup';
import DataChart from '@/components/charts/DataChart';
import DataTable from '@/components/data/DataTable';
import styles from './Dashboard.module.css';

interface DashboardProps {
  rawData: CSVData;
  onDataCleaned?: (cleanedData: CSVData, result: DataCleaningResult) => void;
}

export default function Dashboard({ rawData, onDataCleaned }: DashboardProps) {
  const [cleaningOptions, setCleaningOptions] = useState<DataCleaningOptions>({
    removeDuplicates: true,
    handleMissingValues: true,
    standardizeDates: true,
    trimWhitespace: true,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'table'>('overview');
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);

  // Clean data based on options
  const { cleanedData, result: cleaningResult } = useMemo(() => {
    return cleanCSVData(rawData, cleaningOptions);
  }, [rawData, cleaningOptions]);

  // Notify parent of data cleaning results - commented out to prevent infinite loop
  // useEffect(() => {
  //   if (onDataCleaned) {
  //     onDataCleaned(cleanedData, cleaningResult);
  //   }
  // }, [cleanedData, cleaningResult, onDataCleaned]);

  const dataStats = useMemo(() => getDataStatistics(cleanedData), [cleanedData]);

  const handleCleaningOptionChange = (option: keyof DataCleaningOptions, value: boolean) => {
    setCleaningOptions(prev => ({ ...prev, [option]: value }));
  };

  const addChart = () => {
    const numericColumns = cleanedData.headers.filter((header, index) => {
      const columnData = cleanedData.rows.map(row => row[index]).filter(Boolean);
      return columnData.some(val => !isNaN(Number(val)));
    });

    if (numericColumns.length === 0) return;

    const newChart: ChartConfig = {
      type: 'bar',
      xAxis: cleanedData.headers[0],
      yAxis: numericColumns[0],
      title: `${cleanedData.headers[0]} vs ${numericColumns[0]}`,
    };

    setChartConfigs(prev => [...prev, newChart]);
  };

  const removeChart = (index: number) => {
    setChartConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const updateChart = (index: number, updatedConfig: Partial<ChartConfig>) => {
    setChartConfigs(prev => 
      prev.map((config, i) => i === index ? { ...config, ...updatedConfig } : config)
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Data Dashboard</h2>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'charts' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            Charts ({chartConfigs.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'table' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('table')}
          >
            Data Table
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className={styles.overview}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Data Summary</h3>
              <div className={styles.statList}>
                <div className={styles.statItem}>
                  <span>Total Rows:</span>
                  <strong>{dataStats.totalRows}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Total Columns:</span>
                  <strong>{dataStats.totalColumns}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Numeric Columns:</span>
                  <strong>{dataStats.numericColumns}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Date Columns:</span>
                  <strong>{dataStats.dateColumns}</strong>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <h3>Data Quality</h3>
              <div className={styles.statList}>
                <div className={styles.statItem}>
                  <span>Empty Rows:</span>
                  <strong>{dataStats.emptyRows}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Columns with Missing Data:</span>
                  <strong>{dataStats.columnsWithMissingData}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Duplicates Removed:</span>
                  <strong>{cleaningResult.duplicatesRemoved}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Missing Values Handled:</span>
                  <strong>{cleaningResult.missingValuesHandled}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cleaningOptions}>
            <h3>Data Cleaning Options</h3>
            <div className={styles.optionsList}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={cleaningOptions.removeDuplicates}
                  onChange={(e) => handleCleaningOptionChange('removeDuplicates', e.target.checked)}
                />
                Remove duplicate rows
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={cleaningOptions.handleMissingValues}
                  onChange={(e) => handleCleaningOptionChange('handleMissingValues', e.target.checked)}
                />
                Handle missing values
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={cleaningOptions.standardizeDates}
                  onChange={(e) => handleCleaningOptionChange('standardizeDates', e.target.checked)}
                />
                Standardize date formats
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={cleaningOptions.trimWhitespace}
                  onChange={(e) => handleCleaningOptionChange('trimWhitespace', e.target.checked)}
                />
                Trim whitespace
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className={styles.charts}>
          <div className={styles.chartsHeader}>
            <h3>Data Visualizations</h3>
            <button className={styles.addButton} onClick={addChart}>
              + Add Chart
            </button>
          </div>

          {chartConfigs.length === 0 ? (
            <div className={styles.emptyCharts}>
              <p>No charts created yet</p>
              <button className={styles.addButton} onClick={addChart}>
                Create Your First Chart
              </button>
            </div>
          ) : (
            <div className={styles.chartsGrid}>
              {chartConfigs.map((config, index) => (
                <div key={index} className={styles.chartCard}>
                  <div className={styles.chartControls}>
                    <div className={styles.chartSettings}>
                      <select
                        value={config.type}
                        onChange={(e) => updateChart(index, { type: e.target.value as ChartConfig['type'] })}
                        className={styles.select}
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                      </select>

                      <select
                        value={config.xAxis}
                        onChange={(e) => updateChart(index, { xAxis: e.target.value })}
                        className={styles.select}
                      >
                        {cleanedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>

                      <select
                        value={config.yAxis}
                        onChange={(e) => updateChart(index, { yAxis: e.target.value })}
                        className={styles.select}
                      >
                        {cleanedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      className={styles.removeButton}
                      onClick={() => removeChart(index)}
                    >
                      ×
                    </button>
                  </div>

                  <DataChart data={cleanedData} config={config} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'table' && (
        <div className={styles.table}>
          <h3>Data Table</h3>
          <DataTable data={cleanedData} />
        </div>
      )}
    </div>
  );
}