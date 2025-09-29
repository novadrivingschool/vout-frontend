<!-- ActivityReport.vue -->
<template>
   <v-container class="py-6">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-4">
         <div class="d-flex align-center" style="gap:8px;">
            <v-icon color="primary">mdi-timer-outline</v-icon>
            <span class="text-h6 font-weight-semibold">Activity Report</span>
            <v-chip size="small" class="ml-2" :color="states.clock ? 'green' : 'grey'">
               {{ states.clock ? 'Clocked In' : 'Clocked Out' }}
            </v-chip>
         </div>
         <!-- (1) Botón Refresh -->
         <div class="d-flex align-center" style="gap:8px;">
            <v-btn prepend-icon="mdi-refresh" variant="elevated" color="primary" size="small" @click="onRefresh">
               Refresh
            </v-btn>
         </div>
      </div>

      <!-- Overlay Loader (full viewport, bloquea scroll) -->
      <v-overlay v-model="loading" class="align-center justify-center" :scrim="true" opacity="0.25"
         scroll-strategy="block">
         <v-progress-circular indeterminate size="48" />
      </v-overlay>

      <!-- Botonera con imágenes -->
      <v-card class="pa-4 mb-6 wide-card">
         <div class="actions-grid">
            <!-- CLOCK -->
            <div v-if="!states.clock" class="action" @click="onClockIn">
               <v-img :src="imgs.clock_in" height="92" contain />
               <div class="action-label">CLOCK IN</div>
            </div>
            <div v-else-if="states.clock && !isAnySubInProgress" class="action" @click="onClockOut">
               <v-img :src="imgs.clock_out" height="92" contain />
               <div class="action-label">CLOCK OUT</div>
            </div>

            <!-- IN de sub-actividades -->
            <template v-if="states.clock && !isAnySubInProgress">
               <div class="action" @click="onSubIn('lunch')">
                  <v-img :src="imgs.lunch_in" height="92" contain />
                  <div class="action-label">LUNCH IN</div>
               </div>
               <div class="action" @click="onSubIn('bio_break')">
                  <v-img :src="imgs.bio_break_in" height="92" contain />
                  <div class="action-label">BIO BREAK IN</div>
               </div>
               <div class="action" @click="onSubIn('activity')">
                  <v-img :src="imgs.activity_in" height="92" contain />
                  <div class="action-label">ACTIVITY IN</div>
               </div>
            </template>

            <!-- OUT sub-actividad activa -->
            <template v-if="states.clock && isAnySubInProgress">
               <div v-if="states.lunch" class="action" @click="onSubOut('lunch')">
                  <v-img :src="imgs.lunch_out" height="92" contain />
                  <div class="action-label">LUNCH OUT</div>
               </div>
               <div v-else-if="states.bio_break" class="action" @click="onSubOut('bio_break')">
                  <v-img :src="imgs.bio_break_out" height="92" contain />
                  <div class="action-label">BIO BREAK OUT</div>
               </div>
               <div v-else-if="states.activity" class="action" @click="onSubOut('activity')">
                  <v-img :src="imgs.activity_out" height="92" contain />
                  <div class="action-label">ACTIVITY OUT</div>
               </div>
            </template>
         </div>
      </v-card>

      <!-- Última operación / payload (solo si el flag lo permite) -->
      <v-card v-if="isDev" class="pa-4 mb-6 wide-card">
         <div class="d-flex align-center mb-2" style="gap:8px;">
            <v-chip :color="lastAction?.mode === 'create' ? 'blue' : 'orange'" size="small" class="text-white">
               {{ lastAction?.mode === 'create' ? 'CREATING' : 'UPDATING' }}
            </v-chip>
            <span class="font-weight-medium">{{ lastAction?.label }}</span>
         </div>
         <pre class="payload-pre">{{ pretty(lastPayload) }}</pre>
      </v-card>

      <!-- Tabla -->
      <v-card class="wide-table">
         <v-data-table :headers="isDev ? headers : headers.filter(h => h.key !== 'action')" :items="records"
            item-key="id" density="compact" :items-per-page="10">
            <template #item.created_date="{ item }"><span class="nowrap">{{ item.created_date }}</span></template>
            <template #item.created_time="{ item }"><span class="nowrap">{{ item.created_time }}</span></template>

            <template #item.customer_name="{ item }">
               <span class="nowrap">{{ item.customer_name || '—' }}</span>
            </template>

            <template #item.type_of_activity="{ item }">
               <v-chip :color="typeChip(item).color" size="small" class="text-white"
                  @contextmenu.prevent="openContextMenu($event, item)">
                  {{ typeChip(item).label }}
               </v-chip>
            </template>

            <template #item.activity_title="{ item }">
               <span @contextmenu.prevent="openContextMenu($event, item)">{{ item.activity_title || '—' }}</span>
            </template>
            <template #item.start_time="{ item }">
               <span @contextmenu.prevent="openContextMenu($event, item)">{{ item.start_time || '—' }}</span>
            </template>
            <template #item.total_time="{ item }"><span>{{ item.total_time || '—' }}</span></template>

            <template #item.activity_desc_icon="{ item }">
               <v-btn v-if="item.activity_title || item.activity_description" variant="text" size="small" icon
                  @click="openViewActivity(item)" :title="'Ver descripción'">
                  <v-icon>mdi-text-box-outline</v-icon>
               </v-btn>
               <span v-else>—</span>
            </template>

            <!-- Columna Op solo en modo dev por flag -->
            <template v-if="isDev" #item.action="{ item }">
               <v-chip size="x-small" :color="item._op === 'create' ? 'blue' : 'orange'" class="text-white">
                  {{ item._op }}
               </v-chip>
            </template>
         </v-data-table>
      </v-card>

      <!-- Menú contextual: solo ACTIVITY -->
      <div v-if="ctx.show" class="ctx-backdrop" @click="closeCtx"></div>
      <div v-if="ctx.show" class="ctx-menu" :style="{ left: ctx.x + 'px', top: ctx.y + 'px' }">
         <div v-if="ctx.row?.type_of_activity === 'ACTIVITY'" class="ctx-item" @click="editActivity(ctx.row!)">
            <v-icon size="16" class="mr-2">mdi-pencil</v-icon> Edit Activity
         </div>
         <div v-if="ctx.row?.type_of_activity === 'ACTIVITY'" class="ctx-item" @click="confirmDelete(ctx.row!)">
            <v-icon size="16" class="mr-2">mdi-delete</v-icon> Delete
         </div>
      </div>

      <!-- Confirmación de borrado con frase -->
      <v-dialog v-model="deleteDlg.show" max-width="480">
         <v-card>
            <v-card-title class="text-subtitle-1">Delete record?</v-card-title>
            <v-card-text>
               <p class="mb-3">
                  This will permanently remove the selected record.
               </p>
               <p class="mb-2">
                  To confirm, please type <strong>“{{ deleteDlg.requiredPhrase }}”</strong> below:
               </p>
               <v-text-field v-model="deleteDlg.confirmText" :label="`Type: ${deleteDlg.requiredPhrase}`"
                  variant="outlined" density="comfortable" autofocus />
            </v-card-text>
            <v-card-actions class="justify-end">
               <v-btn variant="text" @click="deleteDlg.show = false">Cancel</v-btn>
               <v-btn color="error" :disabled="!canConfirmDelete" @click="doDelete">Delete</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar v-model="snackbar.open" :color="snackbar.color" timeout="2000">
         {{ snackbar.text }}
      </v-snackbar>

      <!-- DIALOG: Activity In / Finalize / Edit -->
      <v-dialog v-model="showActivityDialog" persistent max-width="640">
         <v-card>
            <v-card-title class="d-flex justify-space-between">
               <span>
                  {{
                     dialogMode === 'activityIn'
                        ? 'Activity In'
                        : dialogMode === 'activityFinalize'
                           ? 'Finalize Activity'
                           : 'Edit Activity'
                  }}
               </span>
               <v-btn icon variant="text" @click="cancelActivityDialog"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>

            <v-form ref="activityFormRef" v-model="isActivityFormValid">
               <v-card-text>
                  <!-- Activity In -->
                  <template v-if="dialogMode === 'activityIn'">
                     <v-select v-model="selectedCustomer" :items="customers" item-title="name" item-value="uuid"
                        label="Select a Customer" :rules="[v => !!v || 'Customer is required']" return-object
                        required />
                     <v-select v-model="selectedDepartment" :items="departments" item-title="name" item-value="uuid"
                        label="Select a Department" :rules="[v => !!v || 'Department is required']" return-object
                        required />
                  </template>

                  <!-- Finalize Activity -->
                  <template v-else-if="dialogMode === 'activityFinalize'">
                     <v-select v-model="selectedCustomer" :items="customers" item-title="name" item-value="uuid"
                        label="Select a Customer" :rules="[v => !!v || 'Customer is required']" return-object
                        required />
                     <v-select v-model="selectedDepartment" :items="departments" item-title="name" item-value="uuid"
                        label="Select a Department" :rules="[v => !!v || 'Department is required']" return-object
                        required />
                     <v-text-field v-model="activityTitle" label="Title" :rules="[v => !!v || 'Title is required']"
                        class="mt-2" required />
                     <v-textarea v-model="activityDescription" label="Description"
                        :rules="[v => !!v || 'Description is required']" class="mt-2" required />
                  </template>

                  <!-- Edit Activity -->
                  <template v-else>
                     <v-select v-model="selectedCustomer" :items="customers" item-title="name" item-value="uuid"
                        label="Select a Customer" :rules="[v => !!v || 'Customer is required']" return-object
                        required />
                     <v-select v-model="selectedDepartment" :items="departments" item-title="name" item-value="uuid"
                        label="Select a Department" :rules="[v => !!v || 'Department is required']" return-object
                        required />

                     <!-- Solo para actividades cerradas -->
                     <v-text-field v-if="editingIsClosed" v-model="activityTitle" label="Title" class="mt-2" />
                     <v-textarea v-if="editingIsClosed" v-model="activityDescription" label="Description"
                        class="mt-2" />
                  </template>
               </v-card-text>

               <v-card-actions class="justify-end">
                  <v-btn color="primary" @click="
                     dialogMode === 'activityIn'
                        ? submitActivityIn()
                        : dialogMode === 'activityFinalize'
                           ? submitActivityFinalize()
                           : submitActivityEdit()
                     ">
                     {{
                        dialogMode === 'activityIn'
                           ? 'Submit'
                           : dialogMode === 'activityFinalize'
                              ? 'Finalize'
                              : 'Update'
                     }}
                  </v-btn>
               </v-card-actions>
            </v-form>
         </v-card>
      </v-dialog>

      <!-- DIALOG: Ver Activity -->
      <v-dialog v-model="showViewDialog" max-width="560">
         <v-card>
            <v-card-title class="d-flex justify-space-between">
               <span>Activity Details</span>
               <v-btn icon variant="text" @click="showViewDialog = false"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <v-card-text>
               <div class="text-subtitle-1 font-weight-600 mb-2">{{ viewItem?.activity_title || 'Untitled' }}</div>
               <div class="text-body-2">{{ viewItem?.activity_description || 'No description' }}</div>
            </v-card-text>
            <v-card-actions class="justify-end">
               <v-btn variant="tonal" @click="showViewDialog = false">Close</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </v-container>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useActivityReportStore } from '@/stores/ActivityReport/ActivityReport'
import { useAuthStore } from '@/stores/auth/auth'
import { useCustomersStore } from '@/stores/customers/customers'
import { useDepartmentsStore } from '@/stores/departments/departments'
import type { ActivityReport } from '@/interfaces/ActivityReport'

/* Flag de entorno: controla payload y columna Op */
const isDev = import.meta.env.VITE_FEATURE_ACTIVITY_DEV === 'true'

/* ---------- Helpers Chicago TZ & diff ---------- */
function nowChicago() {
   const now = new Date()
   const toTZ = (d: Date, tz: string) => new Date(d.toLocaleString('en-US', { timeZone: tz }))
   const d = toTZ(now, 'America/Chicago')
   const p = (n: number) => String(n).padStart(2, '0')
   return {
      date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
      time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
   }
}
function diffHHMMSS(start: string, end: string) {
   const N = (s: string) => s.split(':').map(Number)
   const [sh, sm, ss] = N(start); const [eh, em, es] = N(end)
   const s = sh * 3600 + sm * 60 + ss, e = eh * 3600 + em * 60 + es, d = Math.max(0, e - s)
   const p = (n: number) => String(n).padStart(2, '0')
   return `${p(Math.floor(d / 3600))}:${p(Math.floor((d % 3600) / 60))}:${p(d % 60)}`
}

/* ---------- Imagenes ---------- */
const imgs = {
   clock_in: new URL('@/assets/ActivityReport/clock_in.png', import.meta.url).href,
   clock_out: new URL('@/assets/ActivityReport/clock_out.png', import.meta.url).href,
   lunch_in: new URL('@/assets/ActivityReport/lunch_in.png', import.meta.url).href,
   lunch_out: new URL('@/assets/ActivityReport/lunch_out.png', import.meta.url).href,
   bio_break_in: new URL('@/assets/ActivityReport/bio_break_in.png', import.meta.url).href,
   bio_break_out: new URL('@/assets/ActivityReport/bio_break_out.png', import.meta.url).href,
   activity_in: new URL('@/assets/ActivityReport/activity_in.png', import.meta.url).href,
   activity_out: new URL('@/assets/ActivityReport/activity_out.png', import.meta.url).href,
}

/* ---------- Stores ---------- */
const ar = useActivityReportStore()
const auth = useAuthStore()
const customersStore = useCustomersStore()
const departmentsStore = useDepartmentsStore()

/* Catálogos desde stores */
const customers = computed(() => customersStore.customers)
const departments = computed(() => departmentsStore.departments)

/* ---------- Estado / UI ---------- */
type SubType = 'lunch' | 'bio_break' | 'activity'
type States = { clock: boolean; lunch: boolean; bio_break: boolean; activity: boolean }

// Alias directo al estado del store
const states: States = ar.states

type Row = {
   id: string
   created_date: string
   created_time: string
   type_of_activity: string
   customer_uuid?: string
   customer_code?: string
   customer_name?: string
   customer_description?: string
   customer_department_name?: string
   activity_title?: string
   activity_description?: string
   start_time?: string
   end_time?: string
   total_time?: string
   _op: 'create' | 'update'
}
const records = ref<Row[]>([])

const isAnySubInProgress = computed(() => states.lunch || states.bio_break || states.activity)

const snackbar = reactive({ open: false, text: '', color: 'success' as 'success' | 'warning' | 'error' | 'info' })
const loading = ref(false)
const lastAction = ref<{ mode: 'create' | 'update'; label: string } | null>(null)
const lastPayload = ref<any>(null)
function showSnack(text: string, color: typeof snackbar.color = 'success') { snackbar.text = text; snackbar.color = color; snackbar.open = true }
function logPayload(mode: 'create' | 'update', label: string, payload: any) {
   lastAction.value = { mode, label }
   lastPayload.value = payload
   console.log(mode === 'create' ? 'Create →' : 'Update →', label, payload)
}

/* ---------- Tabla: headers ---------- */
type VHeader = { title: string; key: string; sortable?: boolean }
const headers: VHeader[] = [
   { title: 'Fecha', key: 'created_date' },
   { title: 'Hora', key: 'created_time' },
   { title: 'Tipo', key: 'type_of_activity' },
   { title: 'Start', key: 'start_time' },
   { title: 'End', key: 'end_time' },
   { title: 'Total', key: 'total_time' },
   { title: 'Customer', key: 'customer_name' },
   { title: 'Department', key: 'customer_department_name' },
   { title: 'Activity Desc.', key: 'activity_desc_icon', sortable: false },
   { title: 'Op', key: 'action' }, // se oculta con el flag
]

/* ---------- Dialog ---------- */
type DialogMode = 'activityIn' | 'activityFinalize' | 'edit'
const dialogMode = ref<DialogMode>('activityIn')
const showActivityDialog = ref(false)
const activityFormRef = ref()
const isActivityFormValid = ref(false)
const selectedCustomer = ref<any | null>(null)
const selectedDepartment = ref<any | null>(null)
const activityTitle = ref(''); const activityDescription = ref('')
const editingId = ref<string | null>(null)
const editingIsClosed = ref(false) // 👈 flag: la activity que edito estaba OUT
let clockOutAfterFinalize = false
let finalizeFromActivityOut = false

/* ---------- Mounted ---------- */
onMounted(async () => {
   try {
      loading.value = true
      auth.applyAuthHeader()
      await Promise.all([
         customersStore.loadData(),
         departmentsStore.loadData(),
      ])
      await onRefresh()
   } finally {
      loading.value = false
   }
})

/* ---------- (1) REFRESH ---------- */
async function onRefresh() {
   try {
      loading.value = true
      auth.applyAuthHeader()

      const employeeNumber =
         auth.user?.employee_number ||
         ar.employee_data?.employee_number ||
         ''

      if (!employeeNumber) {
         // sin usuario, forzar vista inicial
         hardResetToClockInView()
         return
      }

      await ar.loadLastLog(employeeNumber)
      await ar.loadTodayLogs(employeeNumber)

      records.value = normalizeAndSort((ar.activityReports || []).map(mapReportToRow))

      if (records.value.length === 0) {
         hardResetToClockInView()   // ← muestra sólo CLOCK IN
      } else {
         recomputeStatesFromRecords()
      }
   } catch (e) {
      console.warn('No se pudo refrescar:', e)
      hardResetToClockInView()
   } finally {
      loading.value = false
      await nextTick()
   }
}

/* ---------- Abrir/cerrar diálogos ---------- */
function openActivityDialog(mode: DialogMode) {
   dialogMode.value = mode
   if (mode === 'activityIn') {
      selectedCustomer.value = customers.value[0] ?? null
      selectedDepartment.value = departments.value[0] ?? null
      activityTitle.value = ''
      activityDescription.value = ''
   } else if (mode === 'activityFinalize') {
      prefillFinalizeCustomerDept()
      activityTitle.value = ''
      activityDescription.value = ''
   }
   showActivityDialog.value = true
}
function prefillFinalizeCustomerDept() {
   const row = records.value.find(r => r.type_of_activity === 'ACTIVITY' && (!r.end_time || r.end_time === '00:00:00'))
   if (row) {
      selectedCustomer.value = customers.value.find(c => c.uuid === row.customer_uuid) ?? customers.value[0] ?? null
      selectedDepartment.value = departments.value.find(d => d.name === row.customer_department_name) ?? departments.value[0] ?? null
   } else {
      selectedCustomer.value = customers.value[0] ?? null
      selectedDepartment.value = departments.value[0] ?? null
   }
}
function cancelActivityDialog() {
   showActivityDialog.value = false
   editingId.value = null
   editingIsClosed.value = false
   clockOutAfterFinalize = false
   finalizeFromActivityOut = false
}

/* ---------- Ver Activity ---------- */
const showViewDialog = ref(false)
const viewItem = ref<Row | null>(null)
function openViewActivity(item: Row) { viewItem.value = item; showViewDialog.value = true }

/* ---------- Menú contextual (solo ACTIVITY) ---------- */
const ctx = reactive<{ show: boolean; x: number; y: number; row: Row | null }>({ show: false, x: 0, y: 0, row: null })
function openContextMenu(e: MouseEvent, row: Row) {
   if (row.type_of_activity !== 'ACTIVITY') return
   ctx.show = true; ctx.x = e.clientX; ctx.y = e.clientY; ctx.row = row
}
function closeCtx() { ctx.show = false; ctx.row = null }

/* ---------- Delete ---------- */
const deleteDlg = reactive<{ show: boolean; id: string | null; confirmText: string; requiredPhrase: string }>({
   show: false,
   id: null,
   confirmText: '',
   requiredPhrase: 'delete permanently',
})
const canConfirmDelete = computed(() => deleteDlg.confirmText.trim().toLowerCase() === deleteDlg.requiredPhrase)

function confirmDelete(row: Row) {
   deleteDlg.show = true
   deleteDlg.id = row.id
   deleteDlg.confirmText = ''
   closeCtx()
}

/* ---------- Acciones ---------- */
async function onClockIn() {
   try {
      loading.value = true
      const t = nowChicago()

      // UI inmediata
      ar.states.clock = true
      ar.states.lunch = false
      ar.states.bio_break = false
      ar.states.activity = false

      // 👇 SIN end_time ni total_time
      const payload = buildPayloadStore('CLOCK IN', { start_time: t.time })
      logPayload('create', 'CLOCK IN', payload)

      const created = await ar.addItem(payload as ActivityReport)

      records.value.unshift(rowFromCreate(mapReportToRow(created), 'CLOCK IN'))
      records.value = normalizeAndSort(records.value)

      recomputeStatesFromRecords()
      showSnack('Clock In registered', 'success')
   } catch { showSnack('Error registering Clock In', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function onClockOut() {
   try {
      const openActivity = records.value.find(r => r.type_of_activity === 'ACTIVITY' && (!r.end_time || r.end_time === '00:00:00'))
      if (openActivity) {
         clockOutAfterFinalize = true
         openActivityDialog('activityFinalize')
         return
      }

      loading.value = true
      const t = nowChicago()

      // 👇 SIN end_time ni total_time
      const payload = buildPayloadStore('CLOCK OUT', { start_time: t.time })
      logPayload('create', 'CLOCK OUT', payload)

      const created = await ar.addItem(payload as ActivityReport)
      records.value.unshift(rowFromCreate(mapReportToRow(created), 'CLOCK OUT'))
      records.value = normalizeAndSort(records.value)

      ar.states.lunch = false
      ar.states.bio_break = false
      ar.states.activity = false
      ar.states.clock = false

      recomputeStatesFromRecords()
      showSnack('Clock Out registered', 'success')
   } catch { showSnack('Error registering Clock Out', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function onSubIn(kind: SubType) {
   if (kind === 'activity') { openActivityDialog('activityIn'); return }
   try {
      loading.value = true
      const t = nowChicago()

      if (kind === 'lunch') { ar.states.bio_break = false; ar.states.activity = false; ar.states.lunch = true }
      if (kind === 'bio_break') { ar.states.lunch = false; ar.states.activity = false; ar.states.bio_break = true }

      const label = labelFromKind(kind)
      const payload = buildPayloadStore(label, { start_time: t.time, end_time: '00:00:00', total_time: '00:00:00' })
      logPayload('create', `${label} IN`, payload)

      const created = await ar.addItem(payload as ActivityReport)
      records.value.unshift({
         id: (created as any).uuid ?? (created as any).id,
         created_date: created.created_date!, created_time: created.created_time!,
         type_of_activity: label, start_time: t.time, end_time: '00:00:00', total_time: '00:00:00', _op: 'create'
      })
      records.value = normalizeAndSort(records.value)

      recomputeStatesFromRecords()
      showSnack(`${label} In created`, 'success')
   } catch { showSnack('Error creating record', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function submitActivityIn() {
   // @ts-ignore
   const ok = await activityFormRef.value?.validate(); if (!ok?.valid) return
   try {
      loading.value = true
      const t = nowChicago()
      const cust = selectedCustomer.value!, dept = selectedDepartment.value!

      ar.states.activity = true
      ar.states.lunch = false
      ar.states.bio_break = false

      const payload = buildPayloadStore('ACTIVITY', {
         // customer_uuid: cust.uuid,
         customer_code: cust.code, customer_name: cust.name, customer_description: cust.description,
         customer_department_name: dept.name, start_time: t.time, end_time: '00:00:00', total_time: '00:00:00'
      })
      logPayload('create', 'ACTIVITY IN', payload)

      const created = await ar.addItem(payload as ActivityReport)
      const id = (created as any).uuid || (created as any).id

      records.value.unshift({
         id,
         created_date: created.created_date!, created_time: created.created_time!,
         type_of_activity: 'ACTIVITY',
         customer_uuid: cust.uuid, customer_code: cust.code, customer_name: cust.name, customer_description: cust.description,
         customer_department_name: dept.name,
         start_time: t.time, end_time: '00:00:00', total_time: '00:00:00', _op: 'create'
      })
      records.value = normalizeAndSort(records.value)

      recomputeStatesFromRecords()
      showSnack('Activity In created', 'success')
      showActivityDialog.value = false
   } catch { showSnack('Error creating activity', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function submitActivityFinalize() {
   // @ts-ignore
   const ok = await activityFormRef.value?.validate(); if (!ok?.valid) return
   const openRow = records.value.find(r => r.type_of_activity === 'ACTIVITY' && (!r.end_time || r.end_time === '00:00:00'))
   if (!openRow) { showSnack('There is no open Activity', 'warning'); return }
   try {
      loading.value = true
      const t = nowChicago()
      const total = diffHHMMSS(openRow.start_time || t.time, t.time)
      const cust = selectedCustomer.value!, dept = selectedDepartment.value!

      const payloadUpdate: Partial<ActivityReport> = {
         customer_uuid: cust.uuid, customer_code: cust.code, customer_name: cust.name,
         customer_description: cust.description, customer_department_name: dept.name,
         activity_title: activityTitle.value, activity_description: activityDescription.value,
         end_time: t.time, total_time: total,
         states: { clock: states.clock, lunch: states.lunch, bio_break: states.bio_break, activity: false }
      }
      logPayload('update', 'ACTIVITY FINALIZE', { id: openRow.id, ...payloadUpdate })

      const updated = await ar.updateItem(openRow.id, payloadUpdate)

      const idx = records.value.findIndex(r => r.id === openRow.id)
      if (idx !== -1) {
         records.value[idx] = {
            ...records.value[idx],
            customer_uuid: updated.customer_uuid, customer_code: updated.customer_code, customer_name: updated.customer_name,
            customer_description: updated.customer_description, customer_department_name: updated.customer_department_name,
            activity_title: updated.activity_title, activity_description: updated.activity_description,
            end_time: updated.end_time, total_time: updated.total_time, _op: 'update'
         }
      }
      records.value = normalizeAndSort(records.value)

      ar.states.activity = false
      recomputeStatesFromRecords()

      showActivityDialog.value = false
      showSnack('Activity finished', 'success')

      if (finalizeFromActivityOut) { finalizeFromActivityOut = false; return }
      if (clockOutAfterFinalize) { clockOutAfterFinalize = false; await onClockOut() }
   } catch { showSnack('Error when completing Activity', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function submitActivityEdit() {
   // @ts-ignore
   const ok = await activityFormRef.value?.validate(); if (!ok?.valid || !editingId.value) return
   try {
      loading.value = true
      const cust = selectedCustomer.value!, dept = selectedDepartment.value!

      // payload base (siempre customer/department); agrega title/desc solo si estaba OUT
      const payload: Partial<ActivityReport> = {
         customer_uuid: cust.uuid,
         customer_code: cust.code,
         customer_name: cust.name,
         customer_description: cust.description,
         customer_department_name: dept.name,
         ...(editingIsClosed.value
            ? {
               activity_title: activityTitle.value ?? '',
               activity_description: activityDescription.value ?? '',
            }
            : {}),
         states: { clock: states.clock, lunch: states.lunch, bio_break: states.bio_break, activity: states.activity }
      }
      logPayload('update', 'ACTIVITY EDIT', { id: editingId.value, ...payload })

      const updated = await ar.updateItem(editingId.value, payload)

      const idx = records.value.findIndex(r => r.id === editingId.value)
      if (idx !== -1) {
         records.value[idx] = {
            ...records.value[idx],
            customer_uuid: updated.customer_uuid, customer_code: updated.customer_code, customer_name: updated.customer_name,
            customer_description: updated.customer_description, customer_department_name: updated.customer_department_name,
            ...(editingIsClosed.value
               ? {
                  activity_title: updated.activity_title,
                  activity_description: updated.activity_description,
               }
               : {}),
            _op: 'update'
         }
      }
      records.value = normalizeAndSort(records.value)

      recomputeStatesFromRecords()
      showSnack('Activity updated', 'success')
      showActivityDialog.value = false
      editingId.value = null
      editingIsClosed.value = false
   } catch { showSnack('Error updating activity', 'error') }
   finally { loading.value = false; await nextTick() }
}

async function onSubOut(kind: SubType) {
   if (kind === 'activity') { finalizeFromActivityOut = true; openActivityDialog('activityFinalize'); return }
   const label = labelFromKind(kind)
   const pend = records.value.find(r => r.type_of_activity === label && (!r.end_time || r.end_time === '00:00:00'))
   if (!pend) return

   try {
      loading.value = true
      const t = nowChicago()
      const total = diffHHMMSS(pend.start_time || t.time, t.time)

      if (kind === 'lunch') ar.states.lunch = false
      if (kind === 'bio_break') ar.states.bio_break = false

      const payload: Partial<ActivityReport> = {
         end_time: t.time, total_time: total,
         states: { clock: states.clock, lunch: states.lunch, bio_break: states.bio_break, activity: states.activity }
      }
      logPayload('update', `${label} OUT`, { id: pend.id, ...payload })

      const updated = await ar.updateItem(pend.id, payload)
      const idx = records.value.findIndex(r => r.id === pend.id)
      if (idx !== -1) records.value[idx] = { ...records.value[idx], end_time: updated.end_time, total_time: updated.total_time, _op: 'update' }
      records.value = normalizeAndSort(records.value)

      recomputeStatesFromRecords()
      showSnack(`${label} Out updated`, 'success')
   } catch { showSnack('Error updating', 'error') }
   finally { loading.value = false; await nextTick() }
}

/* ---------- Edit/Borrar ---------- */
function editActivity(row: Row) {
   if (row.type_of_activity !== 'ACTIVITY') return
   editingId.value = row.id

   // cerrada si tiene end_time y no es '00:00:00'
   const isClosed = !!row.end_time && row.end_time !== '00:00:00'
   editingIsClosed.value = isClosed

   selectedCustomer.value = customers.value.find(c => c.uuid === row.customer_uuid) ?? customers.value[0] ?? null
   selectedDepartment.value = departments.value.find(d => d.name === row.customer_department_name) ?? departments.value[0] ?? null

   // Si está cerrada, precargar título/desc; si no, limpiar
   activityTitle.value = isClosed ? (row.activity_title || '') : ''
   activityDescription.value = isClosed ? (row.activity_description || '') : ''

   openActivityDialog('edit')
   closeCtx()
}
function canDelete(row: Row | null | undefined) { return !!row && row.type_of_activity === 'ACTIVITY' }
async function doDelete() {
   if (!deleteDlg.id) return
   try {
      const row = records.value.find(r => r.id === deleteDlg.id)
      if (!canDelete(row)) {
         showSnack('You can only delete Activities.', 'warning')
         deleteDlg.show = false; deleteDlg.id = null
         return
      }
      if (!canConfirmDelete.value) {
         showSnack('Please type the confirmation phrase.', 'warning')
         return
      }

      loading.value = true
      await ar.removeItem(deleteDlg.id)
      records.value = records.value.filter(r => r.id !== deleteDlg.id)

      recomputeStatesFromRecords()
      showSnack('Record deleted', 'success')
   } catch { showSnack('Error deleting record', 'error') }
   finally {
      deleteDlg.show = false
      deleteDlg.id = null
      deleteDlg.confirmText = ''
      loading.value = false
      await nextTick()
   }
}

/* ---------- Utils ---------- */
function pad2NumStr(s: string | undefined) {
   const v = (s == null ? '' : String(s)).replace(/[^0-9]/g, '')
   return v.length === 1 ? ('0' + v) : (v || '00')
}
function toTsNum(r: Row) {
   const date = r.created_date || '0000-00-00'
   const time = r.created_time || '00:00:00'
   const dParts = date.split('-')
   const tParts = time.split(':')
   const YYYY = (dParts[0] || '0000').replace(/[^0-9]/g, '').slice(0, 4) || '0000'
   const MM = pad2NumStr(dParts[1])
   const DD = pad2NumStr(dParts[2])
   const HH = pad2NumStr(tParts[0])
   const MIN = pad2NumStr(tParts[1])
   const SS = pad2NumStr(tParts[2])
   return Number(YYYY + MM + DD + HH + MIN + SS)
}
function normalizeAndSort(list: Row[]): Row[] { return [...list].sort((a, b) => toTsNum(b) - toTsNum(a)) }

function mapReportToRow(r: any): Row {
   const now = nowChicago()
   return {
      id: r.uuid ?? r.id,
      created_date: r.created_date ?? now.date,
      created_time: r.created_time ?? now.time,
      type_of_activity: r.type_of_activity,
      customer_uuid: r.customer_uuid,
      customer_code: r.customer_code,
      customer_name: r.customer_name,
      customer_description: r.customer_description,
      customer_department_name: r.customer_department_name,
      activity_title: r.activity_title,
      activity_description: r.activity_description,
      start_time: r.start_time,
      end_time: r.end_time,
      total_time: r.total_time,
      _op: 'create',
   }
}
function rowFromCreate(createdRow: Row, type: string): Row { return { ...createdRow, type_of_activity: type, _op: 'create' } }
function labelFromKind(kind: SubType) { return kind === 'lunch' ? 'LUNCH' : kind === 'bio_break' ? 'BIO BREAK' : 'ACTIVITY' }
function typeChip(row: Row) {
   let label = row.type_of_activity, color = 'default'
   if (row.type_of_activity === 'CLOCK IN') { color = 'green'; label = 'CLOCK IN' }
   else if (row.type_of_activity === 'CLOCK OUT') { color = 'red'; label = 'CLOCK OUT' }
   else if (['LUNCH', 'BIO BREAK', 'ACTIVITY'].includes(row.type_of_activity)) {
      const isIn = !row.end_time || row.end_time === '00:00:00'
      color = isIn ? 'green' : 'red'
      label = `${row.type_of_activity} ${isIn ? 'IN' : 'OUT'}`
   }
   return { label, color }
}
function pretty(obj: any) { return obj ? JSON.stringify(obj, null, 2) : '' }

/* Estado inicial explícito: muestra CLOCK IN (clock=false) */
function forceInitialStates() {
   ar.states.clock = false
   ar.states.lunch = false
   ar.states.bio_break = false
   ar.states.activity = false
}

/* Reset DURO cuando no hay datos (refresh/table vacía) */
function hardResetToClockInView() {
   records.value = []
   forceInitialStates()
}

/** Recalcular estados a partir de registros en memoria */
function recomputeStatesFromRecords() {
   ar.states.lunch = false
   ar.states.bio_break = false
   ar.states.activity = false

   records.value = normalizeAndSort(records.value)
   if (records.value.length === 0) {
      forceInitialStates()
      return
   }

   const firstClock = records.value.find(r => r.type_of_activity === 'CLOCK IN' || r.type_of_activity === 'CLOCK OUT')
   const isClockedIn = firstClock?.type_of_activity === 'CLOCK IN'
   ar.states.clock = !!isClockedIn

   const openActivity = records.value.find(r => r.type_of_activity === 'ACTIVITY' && (!r.end_time || r.end_time === '00:00:00'))
   const openLunch = records.value.find(r => r.type_of_activity === 'LUNCH' && (!r.end_time || r.end_time === '00:00:00'))
   const openBio = records.value.find(r => r.type_of_activity === 'BIO BREAK' && (!r.end_time || r.end_time === '00:00:00'))

   ar.states.activity = !!openActivity
   ar.states.lunch = !!openLunch
   ar.states.bio_break = !!openBio
}

/* ---------- Payload builder ---------- */
function buildPayloadStore(type_of_activity: string, extra: Record<string, any>) {
   // Construye SOLO con los campos presentes en "extra" para evitar mandar end/total cuando no se requiere.
   const base: Record<string, any> = {
      customer_uuid: extra.customer_uuid,
      customer_code: extra.customer_code,
      customer_name: extra.customer_name,
      customer_description: extra.customer_description,
      customer_department_name: extra.customer_department_name,
      activity_description: extra.activity_description,
      activity_title: extra.activity_title,
      start_time: extra.start_time,
   }
   if (extra.end_time !== undefined) base.end_time = extra.end_time
   if (extra.total_time !== undefined) base.total_time = extra.total_time

   return ar.buildPayload(type_of_activity as any, base)
}
</script>

<style scoped>
.actions-grid {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
   gap: 16px;
}

.action {
   cursor: pointer;
   border-radius: 14px;
   padding: 12px;
   text-align: center;
   border: 1px solid #eee;
   transition: transform .1s, box-shadow .1s;
}

.action:hover {
   transform: translateY(-2px);
   box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
}

.action-label {
   margin-top: 8px;
   font-weight: 600;
   font-size: .9rem;
}

.wide-card {
   max-width: 1200px;
   margin: 0 auto;
}

.wide-table {
   max-width: 1700px;
   width: 100%;
   margin: 0 auto;
}

.nowrap {
   white-space: nowrap;
}

.payload-pre {
   font-family: ui-monospace, Menlo, Consolas, monospace;
   font-size: 12px;
   background: #0f172a;
   color: #e2e8f0;
   border-radius: 10px;
   padding: 12px;
   white-space: pre-wrap;
}

/* Menú contextual */
.ctx-backdrop {
   position: fixed;
   inset: 0;
   background: transparent;
   z-index: 2500;
}

.ctx-menu {
   position: fixed;
   z-index: 2501;
   min-width: 200px;
   background: #fff;
   border: 1px solid #e5e7eb;
   border-radius: 10px;
   box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
   padding: 6px;
}

.ctx-item {
   display: flex;
   align-items: center;
   padding: 8px 10px;
   cursor: pointer;
   border-radius: 8px;
}

.ctx-item:hover {
   background: #f5f7fb;
}

.wide-table :deep(.v-data-table) {
   width: 100%;
}
</style>
