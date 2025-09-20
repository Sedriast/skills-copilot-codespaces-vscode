'use client';

import { useState, useMemo } from 'react';
import { CSVData, TableFilter } from '@/types';
import styles from './DataTable.module.css';

interface DataTableProps {
  data: CSVData;
  maxRows?: number;
  className?: string;
}

export default function DataTable({ data, maxRows = 50, className }: DataTableProps) {
  const [filter, setFilter] = useState<TableFilter>({
    searchTerm: '',
    columnFilters: [],
    sortColumn: undefined,
    sortDirection: 'asc',
  });

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data.rows];

    // Apply search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.some(cell =>
          String(cell || '').toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply column filters
    filter.columnFilters.forEach(colFilter => {
      const columnIndex = data.headers.indexOf(colFilter.column);
      if (columnIndex !== -1) {
        filtered = filtered.filter(row => {
          const cellValue = row[columnIndex];
          const cellString = String(cellValue || '').toLowerCase();
          const filterValue = String(colFilter.value).toLowerCase();

          switch (colFilter.operator) {
            case 'equals':
              return cellString === filterValue;
            case 'contains':
              return cellString.includes(filterValue);
            case 'not_equals':
              return cellString !== filterValue;
            case 'greater_than':
              return Number(cellValue) > Number(colFilter.value);
            case 'less_than':
              return Number(cellValue) < Number(colFilter.value);
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    if (filter.sortColumn) {
      const sortIndex = data.headers.indexOf(filter.sortColumn);
      if (sortIndex !== -1) {
        filtered.sort((a, b) => {
          const aVal = a[sortIndex];
          const bVal = b[sortIndex];

          // Handle null values
          if (aVal === null && bVal === null) return 0;
          if (aVal === null) return 1;
          if (bVal === null) return -1;

          // Try numeric comparison first
          const aNum = Number(aVal);
          const bNum = Number(bVal);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return filter.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
          }

          // String comparison
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          const result = aStr.localeCompare(bStr);
          return filter.sortDirection === 'asc' ? result : -result;
        });
      }
    }

    return filtered.slice(0, maxRows);
  }, [data, filter, maxRows]);

  const handleSort = (column: string) => {
    setFilter(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  // Removed unused addColumnFilter function to fix ESLint warning

  const removeColumnFilter = (index: number) => {
    setFilter(prev => ({
      ...prev,
      columnFilters: prev.columnFilters.filter((_, i) => i !== index)
    }));
  };

  const getSortIcon = (column: string) => {
    if (filter.sortColumn !== column) return '↕️';
    return filter.sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search all columns..."
            value={filter.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {filter.columnFilters.length > 0 && (
          <div className={styles.activeFilters}>
            <span className={styles.filtersLabel}>Active filters:</span>
            {filter.columnFilters.map((colFilter, index) => (
              <div key={index} className={styles.filterTag}>
                <span>
                  {colFilter.column} {colFilter.operator.replace('_', ' ')} &quot;{colFilter.value}&quot;
                </span>
                <button
                  onClick={() => removeColumnFilter(index)}
                  className={styles.removeFilterButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {data.headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className={styles.headerCell}
                >
                  <span className={styles.headerContent}>
                    {header}
                    <span className={styles.sortIcon}>{getSortIcon(header)}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.dataRow}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.dataCell}>
                    {cell !== null ? String(cell) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className={styles.noData}>
            <p>No data matches your current filters</p>
            <small>Try adjusting your search terms or removing some filters</small>
          </div>
        )}
      </div>

      <div className={styles.tableInfo}>
        <span>
          Showing {filteredData.length} of {data.rows.length} rows
          {filteredData.length === maxRows && data.rows.length > maxRows && ` (limited to ${maxRows})`}
        </span>
      </div>
    </div>
  );
}