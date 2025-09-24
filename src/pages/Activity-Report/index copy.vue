<template>
   <div class="activity-page">
      <!-- Capa de fondo fija detrás de todo -->
      <div class="page-bg"></div>
      <v-container fluid>
         <v-row justify="center">
            <v-col cols="12" md="10" lg="8">
               <!-- Card principal -->
               <v-card elevation="3" class="pa-6">
                  <div v-if="isLoading" class="text-center my-6">
                     <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>

                  <div v-else class="text-center mb-8">
                     <!-- CLOCK IN -->
                     <v-row v-if="!activityReportStore.estados.clock" justify="center" class="mt-6">
                        <v-col cols="auto" class="text-center cursor-pointer" @click="clockIn">
                           <v-img src="@/assets/LogosActivityReport/clockInLogo.png" max-width="90" class="mx-auto"
                              alt="Clock In" />
                           <div class="mt-2 font-medium text-lg">CLOCK IN</div>
                        </v-col>
                     </v-row>

                     <!-- BOTONES PRINCIPALES -->
                     <v-row
                        v-else-if="activityReportStore.estados.clock && !activityReportStore.estados.biobreak && !activityReportStore.estados.lunch && !activityReportStore.estados.activity"
                        justify="center" align="center" class="mt-6">

                        <!-- Clock Out -->
                        <v-col cols="auto" class="text-center cursor-pointer" @click="clockOut">
                           <v-img src="@/assets/LogosActivityReport/clockOutLogo.png" width="80" class="mx-auto"
                              alt="Clock Out" />
                           <div class="mt-2 font-medium text-lg">CLOCK OUT</div>
                        </v-col>

                        <!-- Bio Break -->
                        <v-col cols="auto" class="text-center cursor-pointer" @click="bioBreak">
                           <v-img src="@/assets/LogosActivityReport/bioBreakLogo.png" width="80" class="mx-auto"
                              alt="Bio Break" />
                           <div class="mt-2 font-medium text-lg">BIO BREAK</div>
                        </v-col>

                        <!-- Lunch In -->
                        <v-col cols="auto" class="text-center cursor-pointer" @click="lunchIn">
                           <v-img src="@/assets/LogosActivityReport/lunchInLogo.png" width="80" class="mx-auto"
                              alt="Lunch In" />
                           <div class="mt-2 font-medium text-lg">LUNCH IN</div>
                        </v-col>

                        <!-- Activities In -->
                        <v-col cols="auto" class="text-center cursor-pointer" @click="activityIn">
                           <v-img src="@/assets/LogosActivityReport/activitiesInLogo.png" width="80" class="mx-auto"
                              alt="Activities In" />
                           <div class="mt-2 font-medium text-lg">ACTIVITY IN</div>
                        </v-col>
                     </v-row>

                     <!-- BACK BIO BREAK -->
                     <div v-else-if="activityReportStore.estados.biobreak"
                        style="display:flex; justify-content:center; gap:20px;">
                        <div @click="endBioBreak" style="cursor:pointer;">
                           <v-img src="@/assets/LogosActivityReport/backBioBreakLogo.png" width="100"
                              alt="Back Bio Break" />
                           <div style="margin-top:8px; font-weight:500;">BACK BIO BREAK</div>
                        </div>
                     </div>

                     <!-- LUNCH OUT -->
                     <div v-else-if="activityReportStore.estados.lunch"
                        style="display:flex; justify-content:center; gap:20px;">
                        <div @click="lunchOut" style="cursor:pointer;">
                           <v-img src="@/assets/LogosActivityReport/lunchOutLogo.png" width="100" alt="Lunch Out" />
                           <div style="margin-top:8px; font-weight:500;">LUNCH OUT</div>
                        </div>
                     </div>

                     <!-- ACTIVITIES OUT -->
                     <div v-else-if="activityReportStore.estados.activity"
                        style="display:flex; justify-content:center; gap:20px;">
                        <div @click="openActivityOutDialog" style="cursor:pointer;">
                           <v-img src="@/assets/LogosActivityReport/activitiesOutLogo.png" width="100"
                              alt="Activities Out" />
                           <div style="margin-top:8px; font-weight:500;">ACTIVITY OUT</div>
                        </div>
                     </div>
                  </div>

                  <!-- Divider -->
                  <v-divider class="my-3"></v-divider>

                  <v-data-table :headers="headers" :items="activityReportStore.activityReports" item-key="uuid"
                     class="elevation-1">
                     <!-- DATE -->
                     <template #item.created_date="{ item }">
                        <div class="text-center w-[15%]">{{ item.created_date ?? '' }}</div>
                     </template>

                     <!-- TIME -->
                     <template #item.created_time="{ item }">
                        <div class="text-center w-[10%]">{{ item.created_time ?? '' }}</div>
                     </template>

                     <!-- TYPE OF ACTIVITY -->
                     <template #item.type_of_activity="{ item }">
                        <div class="text-center w-[20%]">{{ item.type_of_activity ?? '' }}</div>
                     </template>

                     <!-- CUSTOMER NAME -->
                     <template #item.customer_name="{ item }">
                        <div class="text-center w-[20%]">{{ item.customer_name ?? '' }}</div>
                     </template>

                     <!-- DEPARTMENT -->
                     <template #item.customer_department_name="{ item }">
                        <div class="text-center w-[15%]">{{ item.customer_department_name ?? '' }}</div>
                     </template>

                     <!-- DESCRIPTION -->
                     <template #item.activity_description="{ item }">
                        <div class="text-center w-[20%]">
                           <v-btn v-if="item.type_of_activity?.startsWith('ACTIVITY OUT') && item.activity_description"
                              icon variant="text" color="primary" class="transition-transform hover:scale-125"
                              @click="openDescription(item.activity_description, item.activity_title ?? '')">
                              <v-icon>mdi-note-text</v-icon>
                           </v-btn>
                        </div>
                     </template>

                     <template #no-data>
                        <div class="text-center text-grey pa-4">No records yet</div>
                     </template>
                  </v-data-table>


                  <!-- Description Dialog -->
                  <v-dialog v-model="showDescriptionDialog" max-width="400">
                     <v-card v-if="showDescriptionDialog">
                        <!-- Contenedor interno con padding -->
                        <div class="p-4">
                           <!-- Título más pequeño -->
                           <v-card-title style="padding-left: 16px; font-size: 0.875rem; font-weight: 500;">
                              Description
                           </v-card-title>

                           <!-- Activity / Reason -->
                           <v-card-subtitle class="text-gray py-0 mb-1 ">
                              {{ selectedReason }}
                           </v-card-subtitle>

                           <!-- Descripción -->
                           <v-card-text class="text-black mt-1" style="font-size: 1.1rem;">
                              {{ selectedDescriptionText }}
                           </v-card-text>

                        </div>
                     </v-card>
                  </v-dialog>


               </v-card>
            </v-col>
         </v-row>

         <!-- Clock Out Dialog -->
         <v-dialog v-model="showClockOutDialog" max-width="400">
            <v-card>
               <v-card-title class="d-flex justify-space-between">
                  <v-icon size="48" color="warning" class="mb-4">mdi-alert</v-icon>
                  Confirm Clock Out
                  <v-btn icon variant="text" density="compact" @click="showClockOutDialog = false">
                     <v-icon>mdi-close</v-icon>
                  </v-btn>
               </v-card-title>

               <v-card-text>
                  <div style="font-size: 18px; margin-bottom: 16px;">
                     You are about to <span style="color: red; font-weight: bold;">clock out</span>
                     and <span style="color: red; font-weight: bold;">close the day</span>, are you sure?
                  </div>
                  <div style="color: gray; font-size: 14px; margin-bottom: 20px;">
                     You need to type <span style="color: red; font-weight: bold;">clock out</span> to confirm.
                  </div>

                  <v-text-field v-model="clockOutReason" label="Reason" placeholder="CLOCK OUT"
                     :input-style="{ textTransform: 'uppercase' }" />
               </v-card-text>

               <v-card-actions class="justify-end">
                  <v-btn color="primary" @click="confirmClockOut">YES</v-btn>
               </v-card-actions>
            </v-card>
         </v-dialog>

         <v-dialog v-model="showActivityOutDialog" persistent max-width="500">
            <v-card>
               <v-card-title class="d-flex justify-space-between">
                  <span>Activity Out</span>
                  <v-btn icon variant="text" @click="closeActivityOutDialog">
                     <v-icon>mdi-close</v-icon>
                  </v-btn>
               </v-card-title>

               <!-- FORM -->
               <v-form v-model="isFormValid">
                  <v-card-text>
                     <v-select v-model="selectedCustomer" :items="customers" item-title="name" item-value="id"
                        label="Select a Customer" :rules="[v => !!v || 'Customer is required']" return-object
                        required></v-select>

                     <v-select v-model="selectedDepartment" :items="departments" item-title="name" item-value="id"
                        label="Select a Department" :rules="[v => !!v || 'Department is required']" return-object
                        required></v-select>
                     <!-- Title -->
                     <v-text-field v-model="activityTitle" label="Title" :rules="[v => !!v || 'Title is required']"
                        required class="mt-4"></v-text-field>

                     <!-- Description -->
                     <v-textarea v-model="activityDescription" label="Description"
                        :rules="[v => !!v || 'Description is required']" required class="mt-2"></v-textarea>
                  </v-card-text>

                  <v-card-actions class="justify-end">
                     <v-btn color="primary" @click="submitActivityOut">Submit</v-btn>
                  </v-card-actions>
               </v-form>
            </v-card>
         </v-dialog>
      </v-container>

   </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers/customers'
import { useDepartmentsStore } from '@/stores/departments/departments'
import { useActivityReportStore, type EmployeeData } from '@/stores/ActivityReport/ActivityReport'
import type { DataTableHeader } from 'vuetify'
import type { ActivityReport } from '@/interfaces/ActivityReport'
import { storeToRefs } from 'pinia'
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth/auth'

import bg from '@/assets/backgrounds/background_6.jpg'
const pageBg = `url(${bg})`

const auth = useAuthStore()

// ------------------------------
// Headers tabla
// ------------------------------
const headers: DataTableHeader[] = [
   { title: 'Date', key: 'created_date', align: 'center' },
   { title: 'Time', key: 'created_time', align: 'center' },
   { title: 'Type of Activity', key: 'type_of_activity', align: 'center' },
   { title: 'Customer Name', key: 'customer_name', align: 'center' },
   { title: 'Department', key: 'customer_department_name', align: 'center' },
   { title: 'Description', key: 'activity_description', align: 'center' },
]

// ------------------------------
// Stores
// ------------------------------
const activityReportStore = useActivityReportStore()
const customersStore = useCustomersStore()
const departmentsStore = useDepartmentsStore()
const { customers } = storeToRefs(customersStore)
const { departments } = storeToRefs(departmentsStore)
const { estados } = storeToRefs(activityReportStore) // toggles centralizado

// ------------------------------
// Computed para template
// ------------------------------
const isClock = computed({
   get: () => estados.value.clock,
   set: v => activityReportStore.estados.clock = v
})
const isLunch = computed({
   get: () => estados.value.lunch,
   set: v => activityReportStore.estados.lunch = v
})
const isBio = computed({
   get: () => estados.value.biobreak,
   set: v => activityReportStore.estados.biobreak = v
})
const isActivity = computed({
   get: () => estados.value.activity,
   set: v => activityReportStore.estados.activity = v
})

let employee_data = {} as EmployeeData;

// ------------------------------
// onMounted - carga inicial
// ------------------------------
const isLoading = ref(true)
onMounted(async () => {
   employee_data = {
      employee_number: auth.user?.employee_number || '',
      employee_name: auth.user?.firstName || '',
      employee_last_name: auth.user?.lastName || '',
   };

   isLoading.value = true
   await customersStore.loadData()
   await departmentsStore.loadData()
   await activityReportStore.loadTodayLogs(employee_data.employee_number)
   await activityReportStore.loadLastLog(employee_data.employee_number)

   if (activityReportStore.lastReport && activityReportStore.lastReport.estados) {
      const t = activityReportStore.lastReport.estados
      activityReportStore.estados.clock = !!t.clock
      activityReportStore.estados.lunch = !!t.lunch
      activityReportStore.estados.biobreak = !!t.biobreak
      activityReportStore.estados.activity = !!t.activity

      //console.log("💡 Toggles cargados desde lastReport:", activityReportStore.estados)
   } else {
      //console.log("💡 No hay lastReport, todos los toggles false")
   }

   isLoading.value = false
})
// ------------------------------
// Reactive states
// ------------------------------

const onBreak = ref(false)
const onLunch = ref(false)
const onActivity = ref(false)
const breakType = ref('') // 'bio' o 'lunch'
const showClockOutDialog = ref(false)
const clockOutReason = ref('')
const showActivityOutDialog = ref(false)
const activityTitle = ref('')
const activityDescription = ref('')
const activityErrors = ref({ title: false, description: false })
const showDescriptionDialog = ref(false)
const selectedDescriptionText = ref('')
const selectedReason = ref('')
const selectedCustomer = ref<any>(null)
const selectedDepartment = ref<any>(null)
const isFormValid = ref(false)

// CLOCK IN
const clockIn = async () => {
   // Actualizamos toggle
   activityReportStore.estados.clock = true


   const payload = activityReportStore.buildPayload("CLOCK IN");
   //console.log("⏱ Clock In - Payload a enviar:", payload)

   const newReport = await activityReportStore.addItem(payload)
   //console.log("✅ Clock In - Registro recibido del backend:", newReport)

   await activityReportStore.loadTodayLogs(employee_data.employee_number)

   // 📥 Log del estado actualizado de la tabla
   //console.log("📋 Tabla actualizada:", activityReportStore.activityReports)
}

// CLOCK OUT
const clockOut = () => {
   showClockOutDialog.value = true
}

const confirmClockOut = async () => {
   if (clockOutReason.value.trim().toUpperCase() !== "CLOCK OUT") {
      alert('You must type "CLOCK OUT" to confirm.')
      return
   }

   // Reset todos los toggles
   activityReportStore.estados.clock = false
   activityReportStore.estados.lunch = false
   activityReportStore.estados.biobreak = false
   activityReportStore.estados.activity = false

   const payload = activityReportStore.buildPayload("CLOCK OUT")
   await activityReportStore.addItem(payload)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)

   showClockOutDialog.value = false
   clockOutReason.value = ""
}

// BIO BREAK
const bioBreak = async () => {
   activityReportStore.estados.biobreak = true
   breakType.value = 'bio'

   const payload = activityReportStore.buildPayload("BIO BREAK")
   console.log("⏱ BIO BREAK IN - Payload a enviar:", payload)

   const newReport = await activityReportStore.addItem(payload)
   //console.log("Bio break in - Registro recibido del backend:", newReport)

   await activityReportStore.loadTodayLogs(employee_data.employee_number)

}

const endBioBreak = async () => {
   activityReportStore.estados.biobreak = false
   breakType.value = ''

   const payload = activityReportStore.buildPayload("BACK BIO BREAK")
   console.log("⏱ BACK BREAK  - Payload a enviar:", payload)

   const newReport = await activityReportStore.addItem(payload)
   //console.log("BACK bio break  - Registro recibido del backend:", newReport)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)
}

// LUNCH
const lunchIn = async () => {
   activityReportStore.estados.lunch = true
   breakType.value = 'lunch'

   const payload = activityReportStore.buildPayload("LUNCH IN")
   //console.log("⏱ LUNCH IN  - Payload a enviar:", payload)

   const newReport = await activityReportStore.addItem(payload)
   //console.log("LUNCH IN  - Registro recibido del backend:", newReport)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)
}

const lunchOut = async () => {
   activityReportStore.estados.lunch = false
   breakType.value = ''

   const payload = activityReportStore.buildPayload("LUNCH OUT")
   //console.log("⏱ LUNCH OUT  - Payload a enviar:", payload)
   const newReport = await activityReportStore.addItem(payload)
   //console.log("LUNCH OUT  - Registro recibido del backend:", newReport)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)
}

// ACTIVITY IN
const activityIn = async () => {
   activityReportStore.estados.activity = true
   onActivity.value = true

   const payload = activityReportStore.buildPayload("ACTIVITY IN")
   //console.log("⏱ ACTIVITY IN  - Payload a enviar:", payload)
   const newReport = await activityReportStore.addItem(payload)
   //console.log("ACTIVITY IN  - Registro recibido del backend:", newReport)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)
}

// ACTIVITY OUT
const openActivityOutDialog = () => {
   showActivityOutDialog.value = true
   activityTitle.value = ''
   activityDescription.value = ''
   activityErrors.value.title = false
   activityErrors.value.description = false
}

const closeActivityOutDialog = () => {
   showActivityOutDialog.value = false
}

const submitActivityOut = async () => {
   if (!isFormValid.value) return
   activityReportStore.estados.activity = false
   const payload = activityReportStore.buildPayload("ACTIVITY OUT", {
      customer_uuid: selectedCustomer.value?.uuid,
      customer_code: selectedCustomer.value?.code,
      customer_name: selectedCustomer.value?.name,
      customer_description: selectedCustomer.value?.description,
      customer_department_name: selectedDepartment.value?.name,
      activity_title: activityTitle.value,
      activity_description: activityDescription.value
   },
      {
         employee_number: employee_data.employee_number,
         employee_name: employee_data.employee_name,
         employee_last_name: employee_data.employee_last_name
      })


   //console.log("⏱ ACTIVITY OUT  - Payload a enviar:", payload)
   const newReport = await activityReportStore.addItem(payload)
   //console.log("ACTIVITY OUT  - Registro recibido del backend:", newReport)
   await activityReportStore.loadTodayLogs(employee_data.employee_number)

   // Reset UI
   showActivityOutDialog.value = false
   onActivity.value = false
   onBreak.value = false
   onLunch.value = false
   activityTitle.value = ""
   activityDescription.value = ""
   selectedCustomer.value = null
   selectedDepartment.value = null
}


// Description Dialog
const openDescription = (desc: string, reason: string) => {
   selectedDescriptionText.value = desc
   selectedReason.value = reason
   showDescriptionDialog.value = true
}
const closeDescription = () => {
   showDescriptionDialog.value = false
   selectedDescriptionText.value = ''
}
</script>

<style scoped>
.activity-page {
  position: relative;
  /* ahora ocupa solo el alto visible MENOS el header/footer */
  min-height: calc(100svh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  z-index: 0;
}

.page-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: v-bind(pageBg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.activity-page > :deep(.v-container) {
  position: relative;
  z-index: 1;
}
</style>

