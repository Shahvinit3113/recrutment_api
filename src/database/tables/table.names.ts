/**
 * Database table name constants
 * 
 * Using constants prevents typos and enables IDE autocompletion.
 * All table names are defined here as a single source of truth.
 */
export const TableNames = {
  User: 'Users',
  UserInfo: 'UserInfo',
  Organization: 'Organization',
  Department: 'Department',
  Position: 'Positions',
  Task: 'Task',
  FormTemplate: 'FormTemplate',
  FormSection: 'FormSection',
  FormField: 'FormField',
  Application: 'Application',
  EmailTemplate: 'EmailTemplate',
  OptionGroup: 'OptionGroup',
  Options: 'Options',
} as const;

/**
 * Type representing all valid table names
 */
export type TableName = (typeof TableNames)[keyof typeof TableNames];

/**
 * Type representing all table name keys
 */
export type TableKey = keyof typeof TableNames;
