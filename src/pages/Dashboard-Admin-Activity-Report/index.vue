<template>
    <v-container class="py-6">
        <v-card class="elevation-3 rounded-lg overflow-hidden">
            <!-- Toolbar -->
            <v-toolbar density="comfortable" color="surface" class="px-4">
                <v-toolbar-title class="text-h6 font-weight-semibold">
                    Activity Summary — Employee
                </v-toolbar-title>

                <v-spacer />

                <div class="d-flex align-center ga-3">
                    <v-btn color="primary" :loading="admin.loading" @click="onExport"
                        :disabled="!hasResults || !isRangeValid">
                        <v-icon start>mdi-microsoft-excel</v-icon>
                        Export Excel
                    </v-btn>
                </div>
            </v-toolbar>

            <v-progress-linear v-if="admin.loading" indeterminate />
            <v-divider />

            <!-- Filter panel -->
            <div class="px-4 pt-4 pb-2">
                <v-card class="pa-4 rounded-lg">
                    <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                        <v-icon class="mr-2">mdi-filter-variant</v-icon>
                        Filters
                    </div>

                    <!-- Range error banner -->
                    <v-alert v-if="bothDatesChosen && !isRangeValid" type="error" variant="tonal" class="mb-3"
                        density="comfortable">
                        Start date cannot be after End date. End date cannot be earlier than Start date.
                    </v-alert>

                    <v-row dense>
                        <!-- Start date -->
                        <v-col cols="12" md="4">
                            <v-menu v-model="menuFrom" :close-on-content-click="false" location="bottom"
                                :offset="[0, 8]" :min-width="340">
                                <template #activator="{ props }">
                                    <v-text-field v-bind="props" readonly v-model="filtersLocal.dateFrom"
                                        label="Start date" placeholder="YYYY-MM-DD" variant="outlined" density="compact"
                                        prepend-inner-icon="mdi-calendar" clearable
                                        :error="bothDatesChosen && !isRangeValid" :error-messages="dateFromErrors"
                                        hide-details="auto" @click="menuFrom = true" @click:clear="clearFrom" />
                                </template>
                                <v-card elevation="10" rounded="lg" class="picker-card">
                                    <v-date-picker class="pretty-picker" color="primary" show-adjacent-months
                                        v-model="pickerFrom" :title="''" :max="filtersLocal.dateTo || undefined"
                                        @update:model-value="onPickFromAndClose" />
                                </v-card>
                            </v-menu>
                        </v-col>

                        <!-- End date -->
                        <v-col cols="12" md="4">
                            <v-menu v-model="menuTo" :close-on-content-click="false" location="bottom" :offset="[0, 8]"
                                :min-width="340">
                                <template #activator="{ props }">
                                    <v-text-field v-bind="props" readonly v-model="filtersLocal.dateTo" label="End date"
                                        placeholder="YYYY-MM-DD" variant="outlined" density="compact"
                                        prepend-inner-icon="mdi-calendar" clearable
                                        :error="bothDatesChosen && !isRangeValid" :error-messages="dateToErrors"
                                        hide-details="auto" @click="menuTo = true" @click:clear="clearTo" />
                                </template>
                                <v-card elevation="10" rounded="lg" class="picker-card">
                                    <v-date-picker class="pretty-picker" color="primary" show-adjacent-months
                                        v-model="pickerTo" :title="''" :min="filtersLocal.dateFrom || undefined"
                                        @update:model-value="onPickToAndClose" />
                                </v-card>
                            </v-menu>
                        </v-col>

                        <!-- Staff (single) -->
                        <v-col cols="12" md="4">
                            <v-autocomplete v-model="filtersLocal.staffId" :items="staffOptions" item-title="label"
                                item-value="employee_number" label="Staff (single)" variant="outlined" density="compact"
                                hide-details="auto" prepend-inner-icon="mdi-account-badge" clearable />
                        </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-2" style="gap:8px;">
                        <v-btn variant="text" :disabled="admin.loading" @click="onResetFilters">
                            <v-icon start>mdi-filter-remove</v-icon>
                            Reset
                        </v-btn>
                        <v-btn color="primary" :loading="admin.loading" @click="onSearch" :disabled="!isSearchable">
                            <v-icon start>mdi-magnify</v-icon>
                            Search
                        </v-btn>
                    </div>
                </v-card>
            </div>

            <!-- DEV payloads (toggle with VITE_FEATURE_ACTIVITY_DEV) -->
            <div v-if="isDev" class="px-4 pb-4">
                <v-card class="pa-4 rounded-lg">
                    <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                        <v-icon class="mr-2">mdi-code-braces-box</v-icon>
                        DEV • Latest payloads
                    </div>

                    <div class="mb-2 font-weight-medium">Search payload</div>
                    <pre class="payload-pre">{{ pretty(lastSearchPayload) }}</pre>

                    <v-divider class="my-4" />

                    <div class="mb-2 font-weight-medium">Export payload</div>
                    <pre class="payload-pre">{{ pretty(lastExportPayload) }}</pre>
                </v-card>
            </div>

            <v-divider />

            <!-- KPI cards -->
            <div class="px-4 pb-4">
                <v-row dense>
                    <v-col cols="12" md="4">
                        <v-card class="pa-4 rounded-xl kpi kpi-activity" elevation="2">
                            <div class="text-body-2 text-medium-emphasis mb-1">Total Activity Time</div>
                            <div class="text-h5 font-weight-bold">{{ fmtDuration(totalActivitySecs) }}</div>
                            <div class="text-caption text-medium-emphasis mt-1">(excludes Lunch and Bio Break)</div>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card class="pa-4 rounded-xl kpi kpi-lunch" elevation="2">
                            <div class="text-body-2 text-medium-emphasis mb-1">Lunch Time</div>
                            <div class="text-h5 font-weight-bold">{{ fmtDuration(totalLunchSecs) }}</div>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card class="pa-4 rounded-xl kpi kpi-bio" elevation="2">
                            <div class="text-body-2 text-medium-emphasis mb-1">Bio Break Time</div>
                            <div class="text-h5 font-weight-bold">{{ fmtDuration(totalBioSecs) }}</div>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- Activities list (no grouping, lightweight chip, show times) -->
            <div class="px-4 pb-6">
                <v-card class="rounded-lg">
                    <v-card-title class="py-4 d-flex align-center ga-2">
                        <v-icon>mdi-clipboard-list</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">
                            Activities (title — customer / department)
                        </span>
                        <v-spacer />
                        <v-chip v-if="activityRows.length" size="small" variant="tonal" color="primary">
                            {{ activityRows.length }} items
                        </v-chip>
                    </v-card-title>
                    <v-divider />
                    <v-card-text>
                        <template v-if="hasResults && activityRows.length">
                            <v-list density="comfortable" lines="three" class="activities-list">
                                <v-list-item v-for="a in activityRows" :key="a.key" :title="a.displayTitle"
                                    class="activity-row">
                                    <template #prepend>
                                        <v-avatar size="34" class="elevation-1">
                                            <v-icon>mdi-briefcase-clock-outline</v-icon>
                                        </v-avatar>
                                    </template>

                                    <template #subtitle>
                                        <div class="text-caption text-medium-emphasis">
                                            {{ a.created_date }} • Start: {{ a.start_time || '—' }} • End: {{ a.end_time
                                            || '—' }}
                                        </div>
                                    </template>

                                    <template #append>
                                        <v-chip v-if="a.isClosed" size="default" color="primary" variant="tonal"
                                            class="metric-chip-tonal">
                                            <v-icon start size="18">mdi-timer-sand</v-icon>
                                            {{ fmtDuration(a.totalSecs) }}
                                        </v-chip>
                                        <v-chip v-else size="default" color="warning" variant="tonal"
                                            class="metric-chip-tonal">
                                            <v-icon start size="18">mdi-progress-clock</v-icon>
                                            Open
                                        </v-chip>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </template>
                        <div v-else class="py-8 text-center text-medium-emphasis">
                            No results yet. Use the filters and click <strong>Search</strong>.
                        </div>
                    </v-card-text>
                </v-card>
            </div>

            <div class="px-4 pb-4 text-caption text-medium-emphasis d-flex align-center">
                <v-icon size="16" class="me-2">mdi-information-outline</v-icon>
                Coordinator-only view • select one staff member, a date range, then run Search.
            </div>
        </v-card>

        <!-- Global overlay -->
        <v-overlay :model-value="admin.loading" class="align-center justify-center" :scrim="true" opacity="0.25"
            scroll-strategy="block">
            <v-progress-circular indeterminate size="42" width="4" />
        </v-overlay>
    </v-container>
</template>

<script setup lang="ts">
/**
 * Changes:
 * - Lightweight chips (tonal) like type chips, not solid.
 * - No grouping: each ACTIVITY row is shown, even with the same title.
 * - Subtitle shows Date • Start • End. Chip shows Total or "Open".
 */
import { computed, reactive, ref, onMounted } from 'vue'
import { definePage } from 'vue-router/auto'
import { useAdminActivityReportStore } from '@/stores/ActivityReport/AdminActivityReport'
import { useUsersStore } from '@/stores/users/users'

definePage({ meta: { requiresAuth: true, roles: ['coordinator', 'admin'] } })

const isDev = import.meta.env.VITE_FEATURE_ACTIVITY_DEV === 'true'

/* Stores */
const admin = useAdminActivityReportStore()
const usersStore = useUsersStore()

onMounted(() => {
    usersStore.fetchUsers?.()
        ; (admin as any).isGrouped = false
})

/* Staff options (single) */
const staffOptions = computed(() => {
    const users = usersStore.users || []
    const toLabel = (u: any) => [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || u.id
    const getEmpNum = (u: any) =>
        u.employee_number ?? u.employeeNumber ?? u.employee_data?.employee_number ?? u.profile?.employee_number ?? null
    return users.map(u => ({ label: toLabel(u), employee_number: getEmpNum(u) })).filter(u => !!u.employee_number)
})

/* Local filters */
type MaybeString = string | null
const filtersLocal = reactive<{ dateFrom: MaybeString; dateTo: MaybeString; staffId: MaybeString }>({
    dateFrom: null,
    dateTo: null,
    staffId: null,
})

/* Date pickers */
const menuFrom = ref(false), menuTo = ref(false)
const pickerFrom = ref<MaybeString>(null), pickerTo = ref<MaybeString>(null)
function toISO(v: any): MaybeString {
    if (!v) return null
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const d = new Date(v); if (isNaN(d.getTime())) return null
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
function onPickFrom(v: any) {
    const iso = toISO(v)
    if (filtersLocal.dateTo && iso && iso > filtersLocal.dateTo) return
    pickerFrom.value = iso; filtersLocal.dateFrom = iso
}
function onPickTo(v: any) {
    const iso = toISO(v)
    if (filtersLocal.dateFrom && iso && iso < filtersLocal.dateFrom) return
    pickerTo.value = iso; filtersLocal.dateTo = iso
}
function onPickFromAndClose(v: any) { onPickFrom(v); menuFrom.value = false }
function onPickToAndClose(v: any) { onPickTo(v); menuTo.value = false }
function clearFrom() { pickerFrom.value = null; filtersLocal.dateFrom = null }
function clearTo() { pickerTo.value = null; filtersLocal.dateTo = null }

/* Date range validation */
const bothDatesChosen = computed(() => !!(filtersLocal.dateFrom && filtersLocal.dateTo))
const isRangeValid = computed(() =>
    !bothDatesChosen.value || (String(filtersLocal.dateFrom) <= String(filtersLocal.dateTo))
)
const dateFromErrors = computed(() =>
    (bothDatesChosen.value && !isRangeValid.value) ? ['Start date cannot be after End date.'] : []
)
const dateToErrors = computed(() =>
    (bothDatesChosen.value && !isRangeValid.value) ? ['End date cannot be earlier than Start date.'] : []
)

/* Search / Export availability */
const isSearchable = computed(() =>
    !!(filtersLocal.dateFrom && filtersLocal.dateTo && filtersLocal.staffId) && isRangeValid.value
)
const hasResults = computed(() => (admin.items?.length || 0) > 0)

/* DEV payload mirrors */
const lastSearchPayload = ref<any>(null)
const lastExportPayload = ref<any>(null)

/* Set filters in store */
function setAdminFiltersFromLocal() {
    admin.setFilters({
        dateFrom: filtersLocal.dateFrom,
        dateTo: filtersLocal.dateTo,
        staffIds: filtersLocal.staffId ? [filtersLocal.staffId] : [],
        customerUuids: [],
        departmentUuids: [],
    } as any)
        ; (admin as any).isGrouped = false
    admin.page = 1
    admin.perPage = Math.max(500, admin.perPage || 0)
}

/* Search / Export */
function onSearch() {
    if (!isSearchable.value) return
    setAdminFiltersFromLocal()
    const payload = { filters: { ...(admin.filters || {}) }, sortBy: admin.sortBy || [], paginated: false }
    lastSearchPayload.value = payload
    // @ts-ignore
    admin.search(payload)
}
function onExport() {
    if (!isRangeValid.value || !hasResults.value) return
    setAdminFiltersFromLocal()
    const payload = { filters: { ...(admin.filters || {}) }, sortBy: admin.sortBy || [], paginated: false }
    lastExportPayload.value = payload
    // @ts-ignore
    admin.exportExcel(payload)
}
function onResetFilters() {
    admin.resetFilters?.()
    filtersLocal.dateFrom = null
    filtersLocal.dateTo = null
    filtersLocal.staffId = null
    pickerFrom.value = null
    pickerTo.value = null
    lastSearchPayload.value = null
    lastExportPayload.value = null
}

/* ---------------- Row helpers & aggregations ---------------- */
type Row = {
    type_of_activity: string
    total_time: string | number | null | undefined
    start_time?: string | null
    end_time?: string | null
    activity_title?: string | null
    customer_name?: string | null
    customer_department_name?: string | null
    created_date?: string | null
}

function toSecs(v: string | number | null | undefined): number {
    if (v == null) return 0
    if (typeof v === 'number') return Math.max(0, Math.floor(v))
    const s = String(v).trim()
    if (/^\d+$/.test(s)) return parseInt(s, 10)
    const mmss = s.match(/^([0-5]?\d):([0-5]\d)$/)
    if (mmss) return (+mmss[1]) * 60 + (+mmss[2])
    const hm = s.match(/^(\d{1,2}):([0-5]\d)$/)
    if (hm) return (+hm[1]) * 3600 + (+hm[2]) * 60
    const hms = s.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/)
    if (hms) return (+hms[1]) * 3600 + (+hms[2]) * 60 + (+hms[3])
    return 0
}
function secsFromStartEnd(r: Row): number {
    const st = (r.start_time || '').trim()
    const et = (r.end_time || '').trim()
    if (!st || !et || et === '00:00:00') return 0
    const p = (t: string) => {
        const m = t.match(/^(\d{1,2}):([0-5]\d):?([0-5]\d)?$/)
        if (!m) return null
        const h = +m[1], mi = +m[2], s = +((m[3] ?? '0'))
        return h * 3600 + mi * 60 + s
    }
    const a = p(st), b = p(et)
    if (a == null || b == null || b < a) return 0
    return b - a
}
function isClosed(r: Row): boolean {
    const et = (r.end_time || '').trim()
    return !!et && et !== '00:00:00'
}
const rows = computed<Row[]>(() => (admin.items as any[]) || [])
function durationFor(r: Row): number {
    const tt = toSecs(r.total_time)
    return tt > 0 ? tt : secsFromStartEnd(r)
}

/* KPIs (closed only for totals) */
const totalActivitySecs = computed(() =>
    rows.value.filter(r => String(r.type_of_activity || '').toUpperCase() === 'ACTIVITY' && isClosed(r))
        .reduce((a, r) => a + durationFor(r), 0)
)
const totalLunchSecs = computed(() =>
    rows.value.filter(r => String(r.type_of_activity || '').toUpperCase() === 'LUNCH' && isClosed(r))
        .reduce((a, r) => a + durationFor(r), 0)
)
const totalBioSecs = computed(() =>
    rows.value.filter(r => String(r.type_of_activity || '').toUpperCase() === 'BIO BREAK' && isClosed(r))
        .reduce((a, r) => a + durationFor(r), 0)
)

/* NO GROUPING: build a flat list of ACTIVITY rows for the list */
type ActivityItem = {
    key: string
    displayTitle: string
    created_date: string | null
    start_time: string | null
    end_time: string | null
    totalSecs: number
    isClosed: boolean
}
const activityRows = computed<ActivityItem[]>(() => {
    const out: ActivityItem[] = []
    for (const r of rows.value) {
        if (String(r.type_of_activity || '').toUpperCase() !== 'ACTIVITY') continue
        const title = (r.activity_title || '—').trim()
        const customer = (r.customer_name || '').trim()
        const department = (r.customer_department_name || '').trim()
        const right = customer && department ? `${customer} / ${department}`
            : customer ? customer
                : department ? department : ''
        const displayTitle = right ? `${title} — ${right}` : title

        const item: ActivityItem = {
            key: [
                r.created_date || '',
                r.start_time || '',
                r.end_time || '',
                title,
                customer,
                department,
                Math.random().toString(36).slice(2, 8), // ensure uniqueness even if same fields
            ].join('|'),
            displayTitle,
            created_date: r.created_date || null,
            start_time: r.start_time || null,
            end_time: r.end_time || null,
            totalSecs: durationFor(r),
            isClosed: isClosed(r),
        }
        out.push(item)
    }
    // Optional: sort by date/time desc
    out.sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')) ||
        String(b.start_time || '').localeCompare(String(a.start_time || '')))
    return out
})

/* Utilities */
function fmtDuration(secs: number) {
    const s = Math.max(0, Math.floor(secs))
    const hh = String(Math.floor(s / 3600)).padStart(2, '0')
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
}
function pretty(obj: any) { return obj ? JSON.stringify(obj, null, 2) : '' }
</script>

<style scoped>
/* DEV payload styling */
.payload-pre {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 10px;
    padding: 12px;
    white-space: pre-wrap;
}

/* Compact date picker visuals */
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

/* KPI cards */
.kpi {
    border: 1px solid rgba(0, 0, 0, .06);
}

.kpi-activity {
    background: linear-gradient(180deg, rgba(33, 150, 243, .06), transparent);
}

.kpi-lunch {
    background: linear-gradient(180deg, rgba(255, 193, 7, .10), transparent);
}

.kpi-bio {
    background: linear-gradient(180deg, rgba(76, 175, 80, .10), transparent);
}

/* Activities list styling */
.activities-list :deep(.v-list-item__content) {
    margin-right: 8px;
}

.activity-row {
    border-bottom: 1px dashed rgba(0, 0, 0, .06);
}

/* Lightweight (tonal) metric chip like type chips */
.metric-chip-tonal {
    font-weight: 600;
}
</style>
