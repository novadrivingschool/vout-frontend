<!-- src/pages/Reports/ActivityAdmin.vue -->
<template>
    <v-container class="py-6">
        <v-card class="elevation-3 rounded-lg overflow-hidden">
            <!-- Toolbar -->
            <v-toolbar density="comfortable" color="surface" class="px-4">
                <v-toolbar-title class="text-h6 font-weight-semibold">
                    Activity Report — Admin
                </v-toolbar-title>

                <v-spacer />

                <div class="d-flex align-center ga-3">
                    <v-btn variant="tonal" color="primary" :loading="admin.loading" @click="onRefresh">
                        <v-icon start>mdi-refresh</v-icon>
                        Refresh
                    </v-btn>

                    <v-btn color="primary" :loading="admin.loading" @click="onExport">
                        <v-icon start>mdi-microsoft-excel</v-icon>
                        Export Excel
                    </v-btn>
                </div>
            </v-toolbar>

            <!-- Loader lineal -->
            <v-progress-linear v-if="admin.loading" indeterminate />

            <v-divider />

            <!-- Filter panel -->
            <div class="px-4 pt-4 pb-2">
                <v-card class="pa-4 rounded-lg">
                    <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                        <v-icon class="mr-2">mdi-filter-variant</v-icon>
                        Filters
                    </div>

                    <v-row dense>
                        <!-- Date From -->
                        <v-col cols="12" md="3">
                            <v-menu v-model="menuFrom" :close-on-content-click="false" location="bottom"
                                :offset="[0, 8]" content-class="dp-menu" :min-width="340">
                                <template #activator="{ props }">
                                    <v-text-field v-bind="props" readonly v-model="filtersLocal.dateFrom"
                                        label="Start date" placeholder="YYYY-MM-DD" variant="outlined" density="compact"
                                        hide-details="auto" prepend-inner-icon="mdi-calendar" clearable
                                        :error="!!dateFromError" :error-messages="dateFromError"
                                        @click="menuFrom = true" @click:clear="clearFrom" />
                                </template>
                                <v-card class="picker-card" elevation="10" rounded="lg">
                                    <v-date-picker class="pretty-picker" color="primary" show-adjacent-months
                                        v-model="pickerFrom" :title="''" :max="filtersLocal.dateTo || undefined"
                                        @update:model-value="onPickFromAndClose" />
                                </v-card>
                            </v-menu>
                        </v-col>

                        <!-- Date To -->
                        <v-col cols="12" md="3">
                            <v-menu v-model="menuTo" :close-on-content-click="false" location="bottom" :offset="[0, 8]"
                                content-class="dp-menu" :min-width="340">
                                <template #activator="{ props }">
                                    <v-text-field v-bind="props" readonly v-model="filtersLocal.dateTo" label="End date"
                                        placeholder="YYYY-MM-DD" variant="outlined" density="compact"
                                        hide-details="auto" prepend-inner-icon="mdi-calendar" clearable
                                        :error="!!dateToError" :error-messages="dateToError" @click="menuTo = true"
                                        @click:clear="clearTo" />
                                </template>
                                <v-card class="picker-card" elevation="10" rounded="lg">
                                    <v-date-picker class="pretty-picker" color="primary" show-adjacent-months
                                        v-model="pickerTo" :title="''" :min="filtersLocal.dateFrom || undefined"
                                        @update:model-value="onPickToAndClose" />
                                </v-card>
                            </v-menu>
                        </v-col>

                        <!-- Staff (multiple) -> employee_number -->
                        <v-col cols="12" md="6">
                            <v-select v-model="filtersLocal.staffIds" :items="staffOptions" item-title="label"
                                item-value="employee_number" label="Staff (multiple)" multiple chips closable-chips
                                variant="outlined" density="compact" hide-details="auto"
                                prepend-inner-icon="mdi-account-multiple" clearable />
                        </v-col>

                        <!-- Customers (multiple) -->
                        <v-col cols="12" md="6">
                            <v-select v-model="filtersLocal.customerUuids" :items="customers" item-title="name"
                                item-value="uuid" label="Customers (multiple)" multiple chips closable-chips
                                variant="outlined" density="compact" hide-details="auto"
                                prepend-inner-icon="mdi-office-building" clearable />
                        </v-col>

                        <!-- Departments (multiple) -> name -->
                        <v-col cols="12" md="6">
                            <v-select v-model="filtersLocal.departmentUuids" :items="departments" item-title="name"
                                item-value="name" label="Departments (multiple)" multiple chips closable-chips
                                variant="outlined" density="compact" hide-details="auto" prepend-inner-icon="mdi-domain"
                                clearable />
                        </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-2" style="gap:8px;">
                        <v-btn variant="text" :disabled="admin.loading" @click="onResetFilters">
                            <v-icon start>mdi-filter-remove</v-icon>
                            Reset
                        </v-btn>

                        <v-btn color="primary" :loading="admin.loading" :disabled="!isDateRangeValid || admin.loading"
                            @click="onApplyFilters">
                            <v-icon start>mdi-check</v-icon>
                            Apply
                        </v-btn>
                    </div>
                </v-card>
            </div>

            <!-- DEV: payloads (NO SE BORRAN) -->
            <div v-if="isDev" class="px-4 pb-4">
                <v-card class="pa-4 rounded-lg">
                    <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                        <v-icon class="mr-2">mdi-code-braces-box</v-icon>
                        DEV • Últimos payloads
                    </div>

                    <div class="mb-2 font-weight-medium">Search payload</div>
                    <pre class="payload-pre">{{ pretty(admin.lastSearchPayload) }}</pre>

                    <v-divider class="my-4" />

                    <div class="mb-2 font-weight-medium">Export payload</div>
                    <pre class="payload-pre">{{ pretty(admin.lastExportPayload) }}</pre>
                </v-card>
            </div>

            <v-divider />

            <!-- Tabla PLANA -->
            <v-data-table-server v-if="!admin.isGrouped" class="bg-surface corporate-table" :headers="headersFlat"
                :items="rowsFlat" :items-length="admin.total" :loading="admin.loading"
                :items-per-page-options="[5, 10, 15, 20, 30, 50]" v-model:page="admin.page"
                v-model:items-per-page="admin.perPage" v-model:sort-by="admin.sortBy" @update:page="onPageChange"
                @update:items-per-page="onPerPageChange" @update:sort-by="onSortChange">
                <!-- Fecha/Hora no-wrap -->
                <template #item.created_date="{ item }">
                    <span class="text-no-wrap">{{ item.created_date }}</span>
                </template>
                <template #item.created_time="{ item }">
                    <span class="text-no-wrap">{{ item.created_time }}</span>
                </template>

                <!-- Staff -->
                <template #item.userName="{ item }">
                    <div class="d-flex align-center ga-2">
                        <v-icon size="16">mdi-account</v-icon>
                        <span>{{ item.userName || '—' }}</span>
                    </div>
                </template>

                <!-- Type (tabla plana) -->
                <template #item.type_of_activity="{ item }">
                    <v-chip :color="typeChip(item).color" size="small" variant="tonal">
                        {{ typeChip(item).label }}
                    </v-chip>
                </template>

                <!-- Activity detail icon SOLO si es ACTIVITY -->
                <template #item.activity="{ item }">
                    <template v-if="String(item.type_of_activity).toUpperCase() === 'ACTIVITY'">
                        <v-btn icon variant="text" @click="openActivityDetail(item)"
                            :aria-label="`Details ${item.userName}`">
                            <v-icon>mdi-information-outline</v-icon>
                        </v-btn>
                    </template>
                    <template v-else>—</template>
                </template>

                <template #no-data>
                    <div class="py-10 text-medium-emphasis text-center">No records found.</div>
                </template>
            </v-data-table-server>

            <!-- Tabla de GRUPOS -->
            <v-data-table-server v-else class="bg-surface corporate-table" :headers="headersGrouped"
                :items="groupRowsPaged" :items-length="groupRows.length" :loading="admin.loading"
                :items-per-page-options="[5, 10, 15, 20, 30, 50]" v-model:page="admin.page"
                v-model:items-per-page="admin.perPage" :sort-by="[]" @update:page="noop"
                @update:items-per-page="onGroupPerPageChange">
                <!-- Abrir actividades del grupo -->
                <template #item.open="{ item }">
                    <v-btn icon variant="text" @click="openGroup(item.groupKey)"
                        :aria-label="`Open ${item.groupLabel}`">
                        <v-icon>mdi-eye</v-icon>
                    </v-btn>
                </template>

                <!-- Etiqueta del grupo: para staff SOLO nombre completo (sin employee_number) -->
                <template #item.groupLabel="{ item }">
                    <div class="d-flex align-center ga-2">
                        <v-icon v-if="admin.groupBy === 'staff'" size="16">mdi-account-badge</v-icon>
                        <v-icon v-else-if="admin.groupBy === 'customer'" size="16">mdi-office-building</v-icon>
                        <v-icon v-else size="16">mdi-domain</v-icon>
                        <span class="font-weight-medium">{{ item.groupLabel }}</span>
                    </div>
                </template>

                <!-- Total por grupo -->
                <template #item.total_time_group="{ item }">
                    <span class="text-no-wrap">{{ item.total_time_group || '00:00:00' }}</span>
                </template>

                <template #no-data>
                    <div class="py-10 text-medium-emphasis text-center">No records found.</div>
                </template>
            </v-data-table-server>

            <v-divider />

            <div class="px-4 py-3 text-caption text-medium-emphasis d-flex align-center">
                <v-icon size="16" class="me-2">mdi-information-outline</v-icon>
                Use the filter panel to query by range, staff, customers and departments.
                <v-spacer />
                <v-chip v-if="admin.isGrouped" size="x-small" variant="tonal" color="primary">
                    Grouped by {{ admin.groupBy }}
                </v-chip>
            </div>
        </v-card>

        <!-- Overlay global -->
        <v-overlay :model-value="admin.loading" class="align-center justify-center" :scrim="true" opacity="0.25"
            scroll-strategy="block">
            <v-progress-circular indeterminate size="42" width="4" />
        </v-overlay>

        <!-- Dialog: actividades del grupo -->
        <v-dialog v-model="dialogOpen" max-width="1000" persistent>
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center ga-3">
                        <v-icon v-if="admin.groupBy === 'staff'">mdi-account-badge</v-icon>
                        <v-icon v-else-if="admin.groupBy === 'customer'">mdi-office-building</v-icon>
                        <v-icon v-else>mdi-domain</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">
                            {{ currentGroupLabel }}
                        </span>
                    </div>
                    <v-btn icon variant="text" @click="dialogOpen = false"
                        :disabled="dialogLoading"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>

                <v-progress-linear v-if="dialogLoading" indeterminate />

                <v-divider />

                <v-card-text>
                    <v-data-table :headers="dialogHeaders" :items="dialogRows" class="bg-surface" density="comfortable"
                        :items-per-page="10">
                        <!-- Fecha/Hora no-wrap -->
                        <template #item.created_date="{ item }">
                            <span class="text-no-wrap">{{ item.created_date }}</span>
                        </template>
                        <template #item.created_time="{ item }">
                            <span class="text-no-wrap">{{ item.created_time }}</span>
                        </template>

                        <template #item.userName="{ item }">
                            <div class="d-flex align-center ga-2">
                                <v-icon size="16">mdi-account</v-icon>
                                <span>{{ item.userName || '—' }}</span>
                            </div>
                        </template>

                        <!-- Type (dentro del diálogo de grupo) -->
                        <template #item.type_of_activity="{ item }">
                            <v-chip :color="typeChip(item).color" size="small" variant="tonal">
                                {{ typeChip(item).label }}
                            </v-chip>
                        </template>

                        <!-- Activity detail icon SOLO si es ACTIVITY -->
                        <template #item.activity="{ item }">
                            <template v-if="String(item.type_of_activity).toUpperCase() === 'ACTIVITY'">
                                <v-btn icon variant="text" @click="openActivityDetail(item)"
                                    :aria-label="`Details ${item.userName}`">
                                    <v-icon>mdi-information-outline</v-icon>
                                </v-btn>
                            </template>
                            <template v-else>—</template>
                        </template>

                        <template #no-data>
                            <div class="py-6 text-medium-emphasis text-center">No activities found.</div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>

            <!-- Overlay del diálogo -->
            <v-overlay :model-value="dialogLoading" class="align-center justify-center" contained :scrim="true"
                opacity="0.12">
                <v-progress-circular indeterminate size="36" width="4" />
            </v-overlay>
        </v-dialog>

        <!-- Dialog: Detalle de Activity (Title + Description) -->
        <v-dialog v-model="activityDialogOpen" max-width="640">
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center ga-3">
                        <v-icon>mdi-information-outline</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">{{ selectedActivity?.activity_title ||
                            'Activity'
                            }}</span>
                    </div>
                    <v-btn icon variant="text" @click="activityDialogOpen = false"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <div class="mb-2 text-caption text-medium-emphasis">
                        {{ selectedActivity?.created_date }} • {{ selectedActivity?.created_time }} • {{
                            selectedActivity?.userName }}
                    </div>
                    <div class="mb-4">
                        <div class="text-subtitle-2 font-weight-medium">Title</div>
                        <div>{{ selectedActivity?.activity_title || '—' }}</div>
                    </div>
                    <div>
                        <div class="text-subtitle-2 font-weight-medium">Description</div>
                        <div class="whitespace-prewrap">{{ selectedActivity?.activity_description || '—' }}</div>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { definePage } from 'vue-router/auto'
import { useAdminActivityReportStore, type AdminRow } from '@/stores/ActivityReport/AdminActivityReport'
import { useUsersStore } from '@/stores/users/users'
import { useCustomersStore } from '@/stores/customers/customers'
import { useDepartmentsStore } from '@/stores/departments/departments'

definePage({ meta: { requiresAuth: true, roles: ['admin'] } })

const isDev = import.meta.env.VITE_FEATURE_ACTIVITY_DEV === 'true'

const admin = useAdminActivityReportStore()
const usersStore = useUsersStore()
const customersStore = useCustomersStore()
const departmentsStore = useDepartmentsStore()

/* Tipos para filas de la tabla de grupos */
interface GroupRow {
    groupKey: string
    groupLabel: string
    count: number
    total_time_group: string // ⬅ NEW: total HH:MM:SS por grupo
}

/* Catalogs */
const staffOptions = computed(() => {
    const users = usersStore.users || []
    const toLabel = (u: any) => [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || u.id
    const getEmpNum = (u: any) =>
        u.employee_number ?? u.employeeNumber ?? u.employee_data?.employee_number ?? u.profile?.employee_number ?? null
    return users
        .map(u => ({ label: toLabel(u), employee_number: getEmpNum(u) }))
        .filter(u => !!u.employee_number)
})
const customers = computed(() => customersStore.customers)
const departments = computed(() => departmentsStore.departments)

/* Local filters */
type MaybeString = string | null
const filtersLocal = reactive<{
    dateFrom: MaybeString
    dateTo: MaybeString
    staffIds: string[]
    customerUuids: string[]
    departmentUuids: string[]
}>({
    dateFrom: admin.filters.dateFrom ?? null,
    dateTo: admin.filters.dateTo ?? null,
    staffIds: [...admin.filters.staffIds],
    customerUuids: [...admin.filters.customerUuids],
    departmentUuids: [...admin.filters.departmentUuids],
})

/* Date pickers */
const menuFrom = ref(false)
const menuTo = ref(false)
const pickerFrom = ref<MaybeString>(filtersLocal.dateFrom)
const pickerTo = ref<MaybeString>(filtersLocal.dateTo)
function toISO(v: any): MaybeString {
    if (!v) return null
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const d = new Date(v)
    if (isNaN(d.getTime())) return null
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
function onPickFrom(v: any) {
    const iso = toISO(v)
    pickerFrom.value = iso
    filtersLocal.dateFrom = iso
}
function onPickTo(v: any) {
    const iso = toISO(v)
    pickerTo.value = iso
    filtersLocal.dateTo = iso
}
function onPickFromAndClose(v: any) {
    onPickFrom(v)
    menuFrom.value = false
}
function onPickToAndClose(v: any) {
    onPickTo(v)
    menuTo.value = false
}
function clearFrom() {
    pickerFrom.value = null
    filtersLocal.dateFrom = null
}
function clearTo() {
    pickerTo.value = null
    filtersLocal.dateTo = null
}

/* ==== Validación de rango de fechas ==== */
const isDateRangeValid = computed(() => {
    const a = filtersLocal.dateFrom
    const b = filtersLocal.dateTo
    if (!a || !b) return true // se permite incompleto
    return a <= b
})
const dateFromError = computed(() => {
    if (!filtersLocal.dateFrom || !filtersLocal.dateTo) return ''
    return filtersLocal.dateFrom > filtersLocal.dateTo ? 'Start date cannot be after End date' : ''
})
const dateToError = computed(() => {
    if (!filtersLocal.dateFrom || !filtersLocal.dateTo) return ''
    return filtersLocal.dateTo < filtersLocal.dateFrom ? 'End date cannot be before Start date' : ''
})

/* Headers — plano */
type Header<T> = {
    title: string
    key: keyof T | string
    sortable?: boolean
    width?: string | number
    align?: 'start' | 'end' | 'center'
}
const headersFlat: ReadonlyArray<Header<AdminRow>> = [
    { title: 'Activity', key: 'activity', sortable: false, width: 76, align: 'center' },
    // { title: 'Time', key: 'created_time', sortable: true, width: 100 },
    { title: 'Staff', key: 'userName', sortable: true, width: 220 },
    { title: 'Type', key: 'type_of_activity', sortable: true, width: 120 },
    { title: 'Date', key: 'created_date', sortable: true, width: 120 },
    { title: 'Start', key: 'start_time', sortable: false, width: 110 },
    { title: 'End', key: 'end_time', sortable: false, width: 110 },
    { title: 'Total', key: 'total_time', sortable: false, width: 110 },
    { title: 'Customer', key: 'customer_name', sortable: true, width: 220 },
    { title: 'Department', key: 'customer_department_name', sortable: true, width: 220 },
]

/* Headers — grupos (con Total agregado) */
const headersGrouped: ReadonlyArray<{
    title: string
    key: string
    width?: number | string
    sortable?: boolean
    align?: 'start' | 'center' | 'end'
}> = [
        { title: '', key: 'open', width: 56, sortable: false, align: 'center' },
        { title: 'Group', key: 'groupLabel', sortable: true },
        { title: 'Count', key: 'count', sortable: true, width: 100, align: 'end' },
        { title: 'Total', key: 'total_time_group', sortable: false, width: 120, align: 'end' }, // ⬅ NEW
    ]

/* Items — plano */
const rowsFlat = computed<AdminRow[]>(() => admin.items)

/* Utils de tiempo HH:MM:SS */
function parseSec(hms?: string | null): number {
    if (!hms) return 0
    const m = String(hms).match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/)
    if (!m) return 0
    const h = Number(m[1])
    const mi = Number(m[2])
    const s = Number(m[3])
    return h * 3600 + mi * 60 + s
}
function fmtHMS(sec: number): string {
    if (sec <= 0) return '00:00:00'
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const p = (n: number) => String(n).padStart(2, '0')
    return `${p(h)}:${p(m)}:${p(s)}`
}

/* Deriva filas de grupos (staff -> solo nombre) + total por grupo */
const groupRows = computed<GroupRow[]>(() => {
    if (!admin.isGrouped || !admin.grouped) return []
    const out: GroupRow[] = []
    for (const [k, arr] of Object.entries(admin.grouped)) {
        if (!Array.isArray(arr) || !arr.length) continue
        const first: any = arr[0]
        let label = k
        if (admin.groupBy === 'staff') {
            const full = [first.employee_name, first.employee_last_name].filter(Boolean).join(' ').trim()
            label = full || k
        } else if (admin.groupBy === 'customer') {
            label = first.customer_name || k
        } else if (admin.groupBy === 'department') {
            label = first.customer_department_name || k
        }

        // suma segura de total_time del grupo
        const totalSeconds = (arr as any[]).reduce((acc, r) => acc + parseSec(r.total_time), 0)
        out.push({ groupKey: k, groupLabel: label, count: arr.length, total_time_group: fmtHMS(totalSeconds) })
    }
    return out
})

/* Paginación client-side para grupos */
const groupRowsPaged = computed<GroupRow[]>(() => {
    const start = (admin.page - 1) * admin.perPage
    return groupRows.value.slice(start, start + admin.perPage)
})

/* Dialog actividades del grupo */
const dialogOpen = ref(false)
const dialogLoading = ref(false)
const currentGroupKey = ref<string>('')
const currentGroupLabel = ref<string>('')

function openGroup(groupKey: string) {
    currentGroupKey.value = groupKey
    const row = groupRows.value.find(r => r.groupKey === groupKey)
    currentGroupLabel.value = row?.groupLabel ?? groupKey
    dialogOpen.value = true
    dialogLoading.value = false
}

/* Headers e items del listado en diálogo de grupo */
const dialogHeaders = [
    { title: 'Activity', key: 'activity', width: 76 },
    // { title: 'Time', key: 'created_time', width: 100 },
    { title: 'Staff', key: 'userName', width: 220 },
    { title: 'Type', key: 'type_of_activity', width: 120 },
    { title: 'Date', key: 'created_date', width: 120 },
    { title: 'Start', key: 'start_time', width: 110 },
    { title: 'End', key: 'end_time', width: 110 },
    { title: 'Total', key: 'total_time', width: 110 },
    { title: 'Customer', key: 'customer_name', width: 220 },
    { title: 'Department', key: 'customer_department_name', width: 220 },
]
const dialogRows = computed<AdminRow[]>(() => {
    if (!admin.isGrouped || !currentGroupKey.value) return []
    const raw = (admin.grouped[currentGroupKey.value] || []) as any[]
    return raw.map(mapRawToAdminRow)
})
function mapRawToAdminRow(r: any): AdminRow {
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

/* Activity detail dialog (Title + Description) */
const activityDialogOpen = ref(false)
const selectedActivity = ref<AdminRow | null>(null)
function openActivityDetail(row: AdminRow) {
    selectedActivity.value = row
    activityDialogOpen.value = true
}

/* Export helpers */
function normalizeSortForBackend(s: any[]): Array<{ key: string; order: 'asc' | 'desc' }> {
    return (s || []).map((x: any) => ({
        key: String(x?.key || 'created_date'),
        order: String(x?.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc',
    }))
}
function buildExportPayloadFromLocal() {
    return {
        filters: {
            dateFrom: filtersLocal.dateFrom ?? null,
            dateTo: filtersLocal.dateTo ?? null,
            staffIds: [...filtersLocal.staffIds],
            customerUuids: [...filtersLocal.customerUuids],
            departmentUuids: [...filtersLocal.departmentUuids],
        },
        sortBy: normalizeSortForBackend(admin.sortBy || []),
    }
}

/* Actions */
function onResetFilters() {
    admin.resetFilters()
    filtersLocal.dateFrom = admin.filters.dateFrom ?? null
    filtersLocal.dateTo = admin.filters.dateTo ?? null
    filtersLocal.staffIds = [...admin.filters.staffIds]
    filtersLocal.customerUuids = [...admin.filters.customerUuids]
    filtersLocal.departmentUuids = [...admin.filters.departmentUuids]
    pickerFrom.value = filtersLocal.dateFrom
    pickerTo.value = filtersLocal.dateTo
}
function onApplyFilters() {
    if (!isDateRangeValid.value) return
    admin.setFilters({
        dateFrom: filtersLocal.dateFrom,
        dateTo: filtersLocal.dateTo,
        staffIds: [...filtersLocal.staffIds],
        customerUuids: [...filtersLocal.customerUuids],
        departmentUuids: [...filtersLocal.departmentUuids],
    })
    admin.page = 1
    admin.search()
}
function onRefresh() {
    admin.search()
}
function onExport() {
    const payload = buildExportPayloadFromLocal()
    admin.setFilters({ ...payload.filters })
    // @ts-ignore
    admin.exportExcel(payload)
}

/* Tabla events */
function onPageChange(p: number) {
    admin.setPage(p)
    if (!admin.isGrouped) admin.search()
}
function onPerPageChange(n: number) {
    admin.setPerPage(n)
    admin.setPage(1)
    if (!admin.isGrouped) admin.search()
}
function onSortChange(s: any) {
    admin.setSortBy(s || [])
    admin.setPage(1)
    if (!admin.isGrouped) admin.search()
}

/* Tabla events (grupos) */
function noop() {
    /* no-op */
}
function onGroupPerPageChange(n: number) {
    admin.setPerPage(n)
    admin.setPage(1)
}

/* Chip type */
function typeChip(row: AdminRow) {
    const t = String(row.type_of_activity || '').toUpperCase().trim()
    const isOpen = !row.end_time || row.end_time === '00:00:00'

    const IN = 'success'
    const OUT = 'error'

    if (t === 'CLOCK IN') return { label: 'CLOCK IN', color: IN }
    if (t === 'CLOCK OUT') return { label: 'CLOCK OUT', color: OUT }

    if (t === 'LUNCH') return { label: `LUNCH ${isOpen ? 'IN' : 'OUT'}`, color: isOpen ? IN : OUT }
    if (t === 'BIO BREAK') return { label: `BIO BREAK ${isOpen ? 'IN' : 'OUT'}`, color: isOpen ? IN : OUT }
    if (t === 'ACTIVITY') return { label: `ACTIVITY ${isOpen ? 'IN' : 'OUT'}`, color: isOpen ? IN : OUT }

    return { label: t || '—', color: IN }
}

/* Helpers */
function pretty(obj: any) {
    return obj ? JSON.stringify(obj, null, 2) : ''
}

/* Init: carga HOY agrupado por STAFF (dateFrom=dateTo=hoy y staffIds=all) */
onMounted(async () => {
    await Promise.all([usersStore.fetchUsers(), customersStore.loadData(), departmentsStore.loadData()])

    const today = toISO(new Date())
    const allStaff = staffOptions.value.map(s => s.employee_number)

    filtersLocal.dateFrom = today
    filtersLocal.dateTo = today
    filtersLocal.staffIds = allStaff

    admin.setFilters({
        dateFrom: filtersLocal.dateFrom,
        dateTo: filtersLocal.dateTo,
        staffIds: [...filtersLocal.staffIds],
        customerUuids: [],
        departmentUuids: [],
    })
    admin.page = 1
    admin.search()
})
</script>

<style scoped>
.corporate-table :deep(.v-data-table__tr)>* {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

/* No wrap para fechas/hora */
.text-no-wrap {
    white-space: nowrap !important;
}

/* Preservar saltos en descripción del detalle */
.whitespace-prewrap {
    white-space: pre-wrap;
}

/* DEV panel */
.payload-pre {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 10px;
    padding: 12px;
    white-space: pre-wrap;
}

/* ===== DatePicker — Compacto, minimal y sin cortes ===== */
:deep(.dp-menu.v-overlay__content) {
    overflow: visible !important;
    min-width: 340px;
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
    padding: 0 !important;
}

.picker-card {
    width: 100%;
    max-width: 360px;
    padding: 8px;
}

:deep(.pretty-picker .v-picker-title),
:deep(.pretty-picker .v-date-picker-title) {
    display: none !important;
}

:deep(.pretty-picker .v-date-picker-controls) {
    padding: 4px 8px !important;
}

:deep(.pretty-picker .v-date-picker-month__day .v-btn) {
    min-width: 36px !important;
    height: 36px !important;
    border-radius: 8px !important;
}

:deep(.pretty-picker),
:deep(.pretty-picker .v-date-picker) {
    width: 100% !important;
    overflow-x: hidden !important;
}
</style>
