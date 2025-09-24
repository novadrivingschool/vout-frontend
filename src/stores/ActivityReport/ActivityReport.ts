import { defineStore } from 'pinia'
import axios from 'axios'
import type { ActivityReport, ActivityKind } from '@/interfaces/ActivityReport'
import { useAuthStore } from '@/stores/auth/auth'

const auth = useAuthStore();
const BASE_URL = import.meta.env.VITE_VOUT_API_URL + '/activity_report'

// --- arriba del archivo ---
function isUUID(v?: string) {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export interface EmployeeData {
  employee_number: string;
  employee_name: string;
  employee_last_name: string;
}

export const useActivityReportStore = defineStore('activityReport', {
  state: () => ({
    activityReports: [] as ActivityReport[],
    lastReport: null as ActivityReport | null,
    perPage: 5,

    // ✅ clave bio_break, no biobreak
    states: {
      clock: false,
      lunch: false,
      bio_break: false,
      activity: false
    } as { clock: boolean; lunch: boolean; bio_break: boolean; activity: boolean },

    employee_data: {} as EmployeeData
  }),

  getters: {
    axiosHeaders(): Record<string, string> {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = (auth as any)?.token || (auth as any)?.accessToken
      if (token) headers['Authorization'] = `Bearer ${token}`
      return headers
    },
  },

  actions: {
    toActivityKind(input: string): ActivityKind {
      const t = (input || '').toUpperCase().trim()
      if (t === 'CLOCK IN' || t === 'CLOCK OUT' || t === 'LUNCH' || t === 'BIO BREAK' || t === 'ACTIVITY') {
        return t as ActivityKind
      }
      if (t === 'CLOCK') {
        return this.states.clock ? 'CLOCK IN' : 'CLOCK OUT'
      }
      console.warn('[toActivityKind] Tipo no reconocido, usando ACTIVITY:', input)
      return 'ACTIVITY'
    },

    nowChicagoTime(): string {
      const now = new Date()
      const toTZ = (d: Date, tz: string) => new Date(d.toLocaleString('en-US', { timeZone: tz }))
      const d = toTZ(now, 'America/Chicago')
      const p = (n: number) => String(n).padStart(2, '0')
      return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    },

    diffHHMMSS(start: string, end: string): string {
      const N = (s: string) => s.split(':').map(Number)
      const [sh, sm, ss] = N(start)
      const [eh, em, es] = N(end)
      const s = sh * 3600 + sm * 60 + ss
      const e = eh * 3600 + em * 60 + es
      const d = Math.max(0, e - s)
      const p = (n: number) => String(n).padStart(2, '0')
      return `${p(Math.floor(d / 3600))}:${p(Math.floor((d % 3600) / 60))}:${p(d % 60)}`
    },

    updateToggles(type: string, isIn: boolean) {
      const t = (type || '').toUpperCase().trim()
      switch (t) {
        case 'CLOCK':
        case 'CLOCK IN':
        case 'CLOCK OUT':
          this.states.clock = isIn; break
        case 'LUNCH':
          this.states.lunch = isIn; break
        case 'BIO BREAK':
          this.states.bio_break = isIn; break
        case 'ACTIVITY':
          this.states.activity = isIn; break
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
        activity_title?: string,
        start_time?: string,
        end_time?: string,
        total_time?: string,
      } = {},
      employeeOptions?: { employee_number: string; employee_name: string; employee_last_name: string }
    ): ActivityReport {

      const kind: ActivityKind = this.toActivityKind(typeOfActivity)

      const employee_number = auth.user?.employee_number
        || employeeOptions?.employee_number
        || this.employee_data.employee_number
        || ''
      const employee_name = auth.user?.firstName
        || employeeOptions?.employee_name
        || this.employee_data.employee_name
        || ''
      const employee_last_name = auth.user?.lastName
        || employeeOptions?.employee_last_name
        || this.employee_data.employee_last_name
        || ''

      const start_time = options.start_time ?? this.nowChicagoTime()
      const end_time = options.end_time ?? '00:00:00'
      const total_time = options.total_time ?? (end_time !== '00:00:00' ? this.diffHHMMSS(start_time, end_time) : '00:00:00')

      const states = {
        clock: !!this.states.clock,
        lunch: !!this.states.lunch,
        bio_break: !!this.states.bio_break,
        activity: !!this.states.activity,
      }

      const payload: ActivityReport = {
        type_of_activity: kind,

        customer_uuid: options.customer_uuid,
        customer_code: options.customer_code,
        customer_name: options.customer_name,
        customer_description: options.customer_description,

        customer_department_name: options.customer_department_name,

        activity_description: options.activity_description,
        activity_title: options.activity_title,

        employee_number,
        employee_name,
        employee_last_name,

        states,
        start_time,
        end_time,
        total_time,
      }

      console.log('💡 Payload generado:', payload)
      return payload
    },

    async addItem(payload: ActivityReport) {
      try {
        console.log('POST →', BASE_URL, payload)
        const response = await axios.post<ActivityReport>(BASE_URL, payload, { headers: this.axiosHeaders })
        const newReport = response.data
        this.activityReports = [newReport, ...this.activityReports]
        this.lastReport = newReport
        return newReport
      } catch (error) {
        console.error('Error creating activity report:', error)
        throw error
      }
    },

    async updateItem(id: string, changes: Partial<ActivityReport>) {
      try {
        const clean: any = { ...changes }
        if ('customer_uuid' in clean && !isUUID(clean.customer_uuid)) {
          delete clean.customer_uuid
        }

        console.log('PATCH →', `${BASE_URL}/${id}`, clean)
        const response = await axios.patch<ActivityReport>(`${BASE_URL}/${id}`, clean, { headers: this.axiosHeaders })
        const updated = response.data

        const idx = this.activityReports.findIndex(r => (r as any).uuid === id || (r as any).id === id)
        if (idx !== -1) this.activityReports[idx] = updated
        if (this.lastReport && ((this.lastReport as any).uuid === id || (this.lastReport as any).id === id)) {
          this.lastReport = updated
        }
        return updated
      } catch (error) {
        console.error('Error updating activity report:', error)
        throw error
      }
    },

    async removeItem(id: string) {
      try {
        console.log('DELETE →', `${BASE_URL}/${id}`)
        await axios.delete(`${BASE_URL}/${id}`, { headers: this.axiosHeaders })
        this.activityReports = this.activityReports.filter(r => ((r as any).uuid ?? (r as any).id) !== id)
        if (this.lastReport && ((this.lastReport as any).uuid === id || (this.lastReport as any).id === id)) {
          this.lastReport = null
        }
      } catch (error) {
        console.error('Error deleting activity report:', error)
        throw error
      }
    },

    async findOneItem(id: string) {
      try {
        console.log('GET →', `${BASE_URL}/${id}`)
        const response = await axios.get<ActivityReport>(`${BASE_URL}/${id}`, { headers: this.axiosHeaders })
        return response.data
      } catch (error) {
        console.error('Error fetching activity report:', error)
        throw error
      }
    },

    async loadTodayLogs(employeeNumber: string) {
      try {
        console.log('GET →', `${BASE_URL}/today/${employeeNumber}`)
        const response = await axios.get<ActivityReport[]>(`${BASE_URL}/today/${employeeNumber}`, { headers: this.axiosHeaders })
        this.activityReports = response.data
      } catch (error) {
        console.error("Error loading today's activities:", error)
        throw error
      }
    },

    async loadLastLog(employeeNumber: string) {
      try {
        console.log('GET →', `${BASE_URL}/last/${employeeNumber}`)
        const response = await axios.get<ActivityReport | null>(`${BASE_URL}/last/${employeeNumber}`, { headers: this.axiosHeaders })
        const last = response.data
        this.lastReport = last ?? null

        if (last) {
          const t = last.states ?? { clock: false, lunch: false, bio_break: false, activity: false }
          // ✅ mutación por propiedad (no reasignar objeto)
          this.states.clock = !!t.clock
          this.states.lunch = !!t.lunch
          this.states.bio_break = !!t.bio_break
          this.states.activity = !!t.activity
        } else {
          // ✅ mutar propiedades; NO reasignes this.states
          this.states.clock = false
          this.states.lunch = false
          this.states.bio_break = false
          this.states.activity = false
        }
      } catch (error) {
        console.error('Error loading last log:', error)
        // En caso de error, también deja el estado en "Clock In" (mutación)
        this.states.clock = false
        this.states.lunch = false
        this.states.bio_break = false
        this.states.activity = false
        throw error
      }
    },
  }
})
