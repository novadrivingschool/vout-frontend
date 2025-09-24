// src/stores/ActivityReport/AdminActivityReport.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth/auth'

export type SortDir = 'asc' | 'desc'

export interface AdminFilters {
    dateFrom: string | null
    dateTo: string | null
    /** employee_number[] */
    staffIds: string[]
    /** customer uuid[] */
    customerUuids: string[]
    /** department name[] */
    departmentUuids: string[]
}

export interface AdminRow {
    id: string
    created_date: string
    created_time: string
    userId: string        // employee_number
    userName: string
    userEmail: string
    type_of_activity: 'CLOCK IN' | 'CLOCK OUT' | 'LUNCH' | 'BIO BREAK' | 'ACTIVITY' | string
    start_time?: string
    end_time?: string
    total_time?: string
    customer_name?: string
    customer_department_name?: string
    activity_title?: string
    activity_description?: string
}

export interface SortBy {
    key: keyof AdminRow | string
    order: SortDir
}

/** 👉 Base URL EXACTA */
const BASE_URL = import.meta.env.VITE_VOUT_API_URL + '/activity_report'
const auth = useAuthStore()

function initialFilters(): AdminFilters {
    return {
        dateFrom: null,
        dateTo: null,
        staffIds: [],
        customerUuids: [],
        departmentUuids: [],
    }
}

/** Normaliza el sort que manda la tabla */
function normalizeSortForBackend(s: SortBy[]): Array<{ key: string; order: 'asc' | 'desc' }> {
    return (s || []).map(x => ({
        key: String(x?.key || 'created_date'),
        order: String(x?.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc',
    }))
}

/** Mapea un Report (backend) a AdminRow (tabla plana) */
function mapReportToRow(r: any): AdminRow {
    const fullName = [r.employee_name, r.employee_last_name].filter(Boolean).join(' ').trim()
    return {
        id: r.uuid ?? r.id ?? crypto.randomUUID(),
        created_date: r.created_date,
        created_time: r.created_time,
        userId: r.employee_number ?? '',
        userName: fullName || r.employee_number || '—',
        userEmail: r.userEmail ?? '',
        type_of_activity: r.type_of_activity,
        start_time: r.start_time,
        end_time: r.end_time,
        total_time: r.total_time,
        customer_name: r.customer_name,
        customer_department_name: r.customer_department_name,
        activity_title: r.activity_title,
        activity_description: r.activity_description,
    }
}

/* 🎨 Colores/labels (consistente con la otra vista) */
const IN_COLOR = 'green'
const OUT_COLOR = 'red'

function isOpen(end_time?: string | null): boolean {
    return !end_time || String(end_time) === '00:00:00'
}

function typeMetaFrom(type: string, end_time?: string | null): { label: string; color: string } {
    const t = String(type || '').toUpperCase().trim()
    const open = isOpen(end_time)

    if (t === 'CLOCK IN') return { label: 'CLOCK IN', color: IN_COLOR }
    if (t === 'CLOCK OUT') return { label: 'CLOCK OUT', color: OUT_COLOR }
    if (t === 'LUNCH') return { label: `LUNCH ${open ? 'IN' : 'OUT'}`, color: open ? IN_COLOR : OUT_COLOR }
    if (t === 'BIO BREAK') return { label: `BIO BREAK ${open ? 'IN' : 'OUT'}`, color: open ? IN_COLOR : OUT_COLOR }
    if (t === 'ACTIVITY') return { label: `ACTIVITY ${open ? 'IN' : 'OUT'}`, color: open ? IN_COLOR : OUT_COLOR }
    return { label: t || '—', color: IN_COLOR }
}

/** Helpers descarga */
function parseFilename(disposition?: string | null): string {
    if (!disposition) return 'activity-report.xlsx'
    // filename*=UTF-8''...  (RFC 5987)
    const star = /filename\*\=UTF-8''([^;]+)$/i.exec(disposition)
    if (star?.[1]) return decodeURIComponent(star[1])
    // filename="..."
    const quoted = /filename=\"?([^\";]+)\"?/i.exec(disposition)
    if (quoted?.[1]) return quoted[1]
    return 'activity-report.xlsx'
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

export const useAdminActivityReportStore = defineStore('adminActivityReport', {
    state: () => ({
        loading: false as boolean,

        // Tabla plana
        items: [] as AdminRow[],
        total: 0 as number,

        // Server-side pagination/sort
        page: 1 as number,
        perPage: 10 as number,
        sortBy: [{ key: 'created_date', order: 'desc' } as SortBy],

        // Filtros
        filters: initialFilters() as AdminFilters,

        // ---- Modo grupos ----
        isGrouped: false as boolean,
        groupBy: null as ('staff' | 'customer' | 'department' | null),
        grouped: {} as Record<string, any[]>,
        groupedTotals: null as null | { overall: number; byGroup: Record<string, number> },

        // DEV panel (últimos payloads)
        lastSearchPayload: null as any,
        lastExportPayload: null as any,
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
        setFilters(partial: Partial<AdminFilters>) {
            this.filters = { ...this.filters, ...partial }
        },

        resetFilters() {
            this.filters = initialFilters()
            this.page = 1
        },

        setPage(n: number) { this.page = n },
        setPerPage(n: number) { this.perPage = n },
        setSortBy(s: SortBy[] | SortBy) { this.sortBy = Array.isArray(s) ? s : [s] },

        isOpen(end_time?: string | null) {
            return isOpen(end_time)
        },
        typeMeta(row: Pick<AdminRow, 'type_of_activity' | 'end_time'>) {
            return typeMetaFrom(row.type_of_activity, row.end_time)
        },

        /** /activity_report/filter */
        async filter() {
            this.loading = true
            try {
                const payload = {
                    filters: { ...this.filters },
                    page: this.page,
                    perPage: this.perPage,
                    sortBy: normalizeSortForBackend(this.sortBy),
                }
                this.lastSearchPayload = payload

                const { data } = await axios.post(`${BASE_URL}/filter`, payload, { headers: this.axiosHeaders })

                if (Array.isArray(data?.items)) {
                    // Plano
                    this.isGrouped = false
                    this.groupBy = null
                    this.grouped = {}
                    this.groupedTotals = null
                    const mapped = data.items.map(mapReportToRow)
                    this.items = mapped
                    this.total = Number(data.total ?? mapped.length) || 0
                    return
                }

                if (data?.data && typeof data.data === 'object') {
                    // Agrupado
                    this.isGrouped = true
                    this.groupBy = data.groupBy ?? null
                    this.grouped = data.data as Record<string, any[]>
                    this.groupedTotals = {
                        overall: Number(data?.totals?.overall ?? 0) || 0,
                        byGroup: data?.totals?.byGroup ?? {},
                    }
                    this.items = []
                    this.total = Object.keys(this.grouped).length
                    return
                }

                // Fallback
                this.isGrouped = false
                this.groupBy = null
                this.grouped = {}
                this.groupedTotals = null
                this.items = []
                this.total = 0
            } catch (e) {
                console.error('Error filtrando activity reports admin:', e)
                this.isGrouped = false
                this.groupBy = null
                this.grouped = {}
                this.groupedTotals = null
                this.items = []
                this.total = 0
            } finally {
                this.loading = false
            }
        },

        async search() {
            return this.filter()
        },

        /** ✅ Exporta Excel llamando al backend y dispara la descarga */
        async exportExcel(payload?: any) {
            const body = payload ?? {
                filters: { ...this.filters },
                sortBy: normalizeSortForBackend(this.sortBy),
            }
            this.lastExportPayload = body

            // Usa el mismo loader global
            const prev = this.loading
            this.loading = true
            try {
                const { data, headers } = await axios.post(
                    `${BASE_URL}/export`,
                    body,
                    {
                        headers: this.axiosHeaders,
                        responseType: 'blob',
                    },
                )

                const filename = parseFilename(headers['content-disposition']) || 'activity-report.xlsx'
                downloadBlob(new Blob([data], { type: headers['content-type'] || 'application/octet-stream' }), filename)
            } catch (e) {
                console.error('Error exportando activity reports admin:', e)
            } finally {
                this.loading = prev
            }
        },
    },
})
