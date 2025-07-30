import { ErrorCodes } from './errorCodes';

export const ERROR_MESSAGES: Record<ErrorCodes, string> = {
  // Authentication & Authorization
  [ErrorCodes.UNAUTHORIZED]: 'Authentication required. Please provide valid credentials.',
  [ErrorCodes.FORBIDDEN]: 'Access denied. You do not have permission to perform this action.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.TOKEN_INVALID]: 'Invalid authentication token. Please log in again.',
  
  // Validation
  [ErrorCodes.VALIDATION_ERROR]: 'The provided data is invalid. Please check your input.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input format. Please provide valid data.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Required field is missing. Please provide all required information.',
  
  // Database
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCodes.DUPLICATE_ENTRY]: 'This record already exists. Please use unique values.',
  [ErrorCodes.FOREIGN_KEY_CONSTRAINT]: 'Cannot perform this action due to related data constraints.',
  [ErrorCodes.RECORD_NOT_FOUND]: 'The requested record was not found.',
  
  // Business Logic
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions to perform this action.',
  [ErrorCodes.RESOURCE_CONFLICT]: 'This action conflicts with existing data. Please resolve conflicts first.',
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 'This operation is not allowed in the current context.',
  [ErrorCodes.QUOTA_EXCEEDED]: 'You have exceeded your quota limit. Please upgrade your plan.',
  
  // File Operations
  [ErrorCodes.FILE_UPLOAD_ERROR]: 'File upload failed. Please try again.',
  [ErrorCodes.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit.',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file format.',
  
  // Network & External Services
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service is currently unavailable. Please try again later.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error occurred. Please check your connection.',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  
  // System
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An internal server error occurred. Our team has been notified.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait before making another request.',
};