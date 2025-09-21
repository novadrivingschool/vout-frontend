import { defineStore } from 'pinia'
import axios from 'axios'
import type { ActivityReport } from '@/interfaces/ActivityReport'
import { useAuthStore } from '@/stores/auth/auth'

const auth = useAuthStore();
const BASE_URL = import.meta.env.VITE_VOUT_API_URL + '/activity_report'

export interface EmployeeData {
  /** Identificador único del empleado, p.ej. "NOVA123" */
  employee_number: string;
  /** Nombre */
  employee_name: string;
  /** Apellido */
  employee_last_name: string;  
}

export const useActivityReportStore = defineStore('activityReport', {
  state: () => ({
    activityReports: [] as ActivityReport[],
    lastReport: null as ActivityReport | null,
    perPage: 5,

    estados: {
      clock: false,
      lunch: false,
      biobreak: false,
      activity: false
    },

    /* employee_data: {
      employee_number: "NOVA123",
      employee_name: "Test",
      employee_last_name: "Test"
    } */
    employee_data: {} as EmployeeData
  }),


  actions: {
    updateToggles(type: string, isIn: boolean) {
      switch (type) {
        case "CLOCK":
          this.estados.clock = isIn
          break
        case "LUNCH":
          this.estados.lunch = isIn
          break
        case "BIO BREAK":
          this.estados.biobreak = isIn
          break
        case "ACTIVITY":
          this.estados.activity = isIn
          break
      }
    },

    buildPayload(
      typeOfActivity: string,
      options: {
        customer_uuid?: string,
        customer_code?: string,
        customer_name?: string,
        customer_description?: string,
        customer_department_name?: string,
        activity_description?: string,
        activity_title?: string
      } = {},
      employeeOptions?: { employee_number: string; employee_name: string; employee_last_name: string }
    ): ActivityReport {
      //const employee = employeeOptions || this.employee_data
      /* const employee =
        employeeOptions ??
        (auth.user
          ? {
            employee_number:
              (auth.user as any).employee_number ??
              (auth.user as any).employeeNumber ??
              auth.user.id ??
              '',
            employee_name:
              (auth.user as any).employee_name ??
              auth.user.firstName ??
              '',
            employee_last_name:
              (auth.user as any).employee_last_name ??
              auth.user.lastName ??
              '',
          }
          : this.employee_data) */

      const payload: ActivityReport = {
        type_of_activity: typeOfActivity,
        customer_uuid: options.customer_uuid,
        customer_code: options.customer_code,
        customer_name: options.customer_name,
        customer_description: options.customer_description,
        customer_department_name: options.customer_department_name,
        activity_description: options.activity_description,
        activity_title: options.activity_title,
        employee_number: auth.user?.employee_number || '',
        employee_name: auth.user?.firstName || '',
        employee_last_name: auth.user?.lastName || '',

        estados: {
          clock: this.estados.clock,
          lunch: this.estados.lunch,
          biobreak: this.estados.biobreak,
          activity: this.estados.activity
        }
      }

      console.log('💡 Payload generado:', payload)
      return payload
    },


    // New register
    async addItem(payload: ActivityReport) {
      try {
        const response = await axios.post<ActivityReport>(BASE_URL, payload)
        const newReport = response.data
        this.activityReports = [newReport, ...this.activityReports]

        this.lastReport = newReport

        return newReport
      } catch (error) {
        console.error('Error creating activity report:', error)
        throw error
      }
    },

    // Load activities of the day
    async loadTodayLogs(employeeNumber: string) {
      try {
        const response = await axios.get<ActivityReport[]>(`${BASE_URL}/today/${employeeNumber}`)
        this.activityReports = response.data
      } catch (error) {
        console.error("Error loading today's activities:", error)
        throw error
      }
    },

    //  Last state
    async loadLastLog(employeeNumber: string) {
      try {
        const response = await axios.get<ActivityReport[]>(`${BASE_URL}/today/${employeeNumber}`)
        const allLogs = response.data
        if (allLogs.length > 0) {
          this.lastReport = allLogs[0];


          const t = this.lastReport.estados ?? { clock: false, lunch: false, biobreak: false, activity: false };
          this.estados.clock = !!t.clock;
          this.estados.lunch = !!t.lunch;
          this.estados.biobreak = !!t.biobreak;
          this.estados.activity = !!t.activity;
        } else {
          this.lastReport = null;
          this.estados = { clock: false, lunch: false, biobreak: false, activity: false };
        }

      } catch (error) {
        console.error('Error loading last log:', error)
        throw error
      }
    },


  }
})
