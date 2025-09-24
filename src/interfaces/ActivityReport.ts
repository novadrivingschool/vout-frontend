// src/interfaces/ActivityReport.ts

export const ActivityKinds = ['CLOCK IN', 'CLOCK OUT', 'LUNCH', 'BIO BREAK', 'ACTIVITY'] as const;
export type ActivityKind = typeof ActivityKinds[number];

export interface ActivityStates {
  clock: boolean;
  lunch: boolean;
  bio_break: boolean;
  activity: boolean;
}

export interface ActivityReport {
  uuid?: string;
  created_date?: string;
  created_time?: string;

  type_of_activity: ActivityKind;   // <- se mantiene estricto

  customer_uuid?: string;
  customer_code?: string;
  customer_name?: string;
  customer_description?: string;

  customer_department_name?: string;

  activity_description?: string;
  activity_title?: string;

  employee_number: string;
  employee_name: string;
  employee_last_name: string;

  states: ActivityStates;

  start_time: string;      // HH:mm:ss
  end_time: string;        // HH:mm:ss
  total_time: string;      // HH:mm:ss
}

export type CreateActivityReportDto = Omit<ActivityReport, 'uuid' | 'created_date' | 'created_time'>;
export type UpdateActivityReportDto = Partial<Omit<ActivityReport, 'uuid' | 'created_date' | 'created_time'>>;
