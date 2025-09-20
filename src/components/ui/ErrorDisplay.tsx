'use client';

import { UploadError } from '@/types';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  error: UploadError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const getErrorIcon = (code: UploadError['code']) => {
    switch (code) {
      case 'FILE_TOO_LARGE':
        return '📁';
      case 'INVALID_FORMAT':
        return '❌';
      case 'PARSING_ERROR':
        return '⚠️';
      case 'NETWORK_ERROR':
        return '🔗';
      default:
        return '❗';
    }
  };

  const getErrorTitle = (code: UploadError['code']) => {
    switch (code) {
      case 'FILE_TOO_LARGE':
        return 'File Too Large';
      case 'INVALID_FORMAT':
        return 'Invalid File Format';
      case 'PARSING_ERROR':
        return 'Data Processing Error';
      case 'NETWORK_ERROR':
        return 'Network Error';
      default:
        return 'Upload Error';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        {getErrorIcon(error.code)}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{getErrorTitle(error.code)}</h3>
        <p className={styles.message}>{error.message}</p>
        <div className={styles.actions}>
          {onRetry && (
            <button 
              className={styles.retryButton}
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button 
              className={styles.dismissButton}
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}