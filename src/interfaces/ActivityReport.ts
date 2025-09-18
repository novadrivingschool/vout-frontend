
export interface ActivityReport {
  uuid?: string
  created_date?: string
  created_time?: string
  type_of_activity: string
  customer_uuid?: string
  customer_code?: string
  customer_name?: string
  customer_description?: string
  customer_department_name?: string
  activity_description?: string
  activity_title?: string
  employee_number: string
  employee_name: string
  employee_last_name: string

  estados: {
    clock: boolean;
    lunch: boolean;
    biobreak: boolean;
    activity: boolean;
  };
}
