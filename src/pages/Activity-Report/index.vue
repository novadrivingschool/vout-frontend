<template>
   <v-container fluid>
      <v-row justify="center">
         <v-col cols="12" md="10" lg="8">
            <!-- Card principal -->
            <v-card elevation="3" class="pa-6">
               <!-- Logo que funciona como botón Clock In -->
               <div class="text-center mb-8">

                  <!-- CLOCK IN -->
                  <div v-if="!clockedIn" @click="clockIn" style="cursor:pointer;">
                     <v-img src="@/assets/LogosActivityReport/clockInLogo.png" max-width="90" class="mx-auto"
                        alt="Clock In" />
                     <div style="margin-top:8px; font-weight:500;">CLOCK IN</div>
                  </div>

                  <!-- BOTONES PRINCIPALES cuando ya clockedIn y no estás en break/lunch/activity -->
                  <div v-else-if="!onBreak && !onLunch && !onActivity"
                     style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap;">

                     <!-- Clock Out -->
                     <div @click="clockOut" style="cursor:pointer; flex: 0  110px; text-align:center;">
                        <v-img src="@/assets/LogosActivityReport/clockOutLogo.png" width="80" alt="Clock Out" />
                        <div style="margin-top:8px; font-weight:500;">CLOCK OUT</div>
                     </div>

                     <!-- Bio Break -->
                     <div @click="bioBreak" style="cursor:pointer; flex: 0  100px; text-align:center;">
                        <v-img src="@/assets/LogosActivityReport/bioBreakLogo.png" width="100" alt="Bio Break" />
                        <div style="margin-top:8px; font-weight:500;">BIO BREAK</div>
                     </div>

                     <!-- Lunch In -->
                     <div @click="lunchIn" style="cursor:pointer; flex: 0  100px; text-align:center;">
                        <v-img src="@/assets/LogosActivityReport/lunchInLogo.png" width="100" alt="Lunch In" />
                        <div style="margin-top:8px; font-weight:500;">LUNCH IN</div>
                     </div>

                     <!-- Activities In -->
                     <div @click="activityIn" style="cursor:pointer;">
                        <v-img src="@/assets/LogosActivityReport/activitiesInLogo.png" width="100"
                           alt="Activities In" />
                        <div style="margin-top:8px; font-weight:500;">ACTIVITY IN</div>
                     </div>

                  </div>

                  <!-- BACK BIO BREAK -->
                  <div v-else-if="onBreak && breakType === 'bio'"
                     style="display:flex; justify-content:center; gap:20px;">
                     <div @click="endBioBreak" style="cursor:pointer;">
                        <v-img src="@/assets/LogosActivityReport/backBioBreakLogo.png" width="100"
                           alt="Back Bio Break" />
                        <div style="margin-top:8px; font-weight:500;">BACK BIO BREAK</div>
                     </div>
                  </div>

                  <!-- LUNCH OUT -->
                  <div v-else-if="onLunch" style="display:flex; justify-content:center; gap:20px;">
                     <div @click="lunchOut" style="cursor:pointer;">
                        <v-img src="@/assets/LogosActivityReport/lunchOutLogo.png" width="100" alt="Lunch Out" />
                        <div style="margin-top:8px; font-weight:500;">LUNCH OUT</div>
                     </div>
                  </div>
                  <!-- ACTIVITIES OUT -->
                  <div v-else-if="onActivity" style="display:flex; justify-content:center; gap:20px;">
                     <div @click="openActivityOutDialog" style="cursor:pointer;">
                        <v-img src="@/assets/LogosActivityReport/activitiesOutLogo.png" width="100"
                           alt="Activities Out" />
                        <div style="margin-top:8px; font-weight:500;">ACTIVITY OUT</div>
                     </div>

                  </div>


               </div>





               <!-- Divider -->
               <v-divider class="my-3"></v-divider>

               <!-- Tabla de registros -->
               <v-table>
                  <thead>
                     <tr>
                        <th style="width: 25%;" class="text-center">Time</th>
                        <th style="width: 50%;" class="text-center">Reason</th>
                        <th style="width: 25%;" class="text-center">Description</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-if="logs.length === 0">
                        <!-- 👇 ojo: ahora la tabla tiene 3 columnas -->
                        <td colspan="3" class="text-center text-grey">No records yet</td>
                     </tr>
                     <tr v-for="(log, index) in logs" :key="index">
                        <td class="text-center">{{ log.time }}</td>
                        <td class="text-center">{{ log.reason }}</td>
                        <td class="text-center">
                           <v-btn v-if="log.reason.startsWith('Activity Out') && log.description" icon variant="text"
                              color="primary" class="transition-transform hover:scale-125"
                              @click="openDescription(log.description, log.reason)">
                              <v-icon>mdi-note-text</v-icon>
                           </v-btn>
                        </td>


                     </tr>
                  </tbody>
               </v-table>
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

            <v-card-text>
               <v-text-field v-model="activityTitle" label="Title" :error="activityErrors.title"
                  :rules="[v => !!v || 'Title is required']" required />
               <v-textarea v-model="activityDescription" label="Description" :error="activityErrors.description"
                  :rules="[v => !!v || 'Description is required']" required />
            </v-card-text>

            <v-card-actions class="justify-end">
               <v-btn color="primary" @click="submitActivityOut">Submit</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>


   </v-container>
</template>

<script>
export default {
   data() {
      return {
         clockedIn: false,
         onBreak: false,
         onLunch: false,
         onActivity: false,
         breakType: '', // 'bio' o 'lunch'
         logs: [],
         showClockOutDialog: false,
         clockOutReason: '',
         showActivityOutDialog: false, // controla visibilidad del diálogo
         activityTitle: '',            // input obligatorio para título
         activityDescription: '',      // input obligatorio para descripción
         activityErrors: {             // para mostrar errores si están vacíos
            title: false,
            description: false
         },
         showDescriptionDialog: false,
         selectedDescriptionText: '',
         selectedReason: ''
      }
   },
   methods: {
      clockIn() {
         this.clockedIn = true;
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Clock In', color: '#A8E6A3' });
      },
      clockOut() {
         this.showClockOutDialog = true;
      },
      confirmClockOut() {
         // Comparamos ignorando mayúsculas y espacios al inicio/final
         if (this.clockOutReason.trim().toUpperCase() === 'CLOCK OUT') {
            this.logs.unshift({
               time: new Date().toLocaleTimeString(),
               color: '#F29C9C',
               reason: 'Clock Out'
            });
            this.clockedIn = false;
            this.showClockOutDialog = false;
            this.clockOutReason = ''; // Limpiar input
         } else {
            alert('You must type "CLOCK OUT" to confirm.');
         }
      }
      ,
      bioBreak() {
         this.onBreak = true;
         this.breakType = 'bio';
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Bio Break' });
      },
      endBioBreak() {
         this.onBreak = false;
         this.breakType = '';
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Back Bio Break' });
      },
      lunchIn() {
         this.onLunch = true;
         this.breakType = 'lunch';
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Lunch in' });
      },
      lunchOut() {
         this.onLunch = false;
         this.breakType = '';
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Lunch out' });
      },
      activityIn() {
         this.onActivity = true;
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Activity In' });
      },
      activityOut() {
         this.onActivity = false;
         this.logs.unshift({ time: new Date().toLocaleTimeString(), reason: 'Activity Out' });
      },
      openActivityOutDialog() {
         this.showActivityOutDialog = true;
         this.activityTitle = '';
         this.activityDescription = '';
         this.activityErrors.title = false;
         this.activityErrors.description = false;
      },
      closeActivityOutDialog() {
         this.showActivityOutDialog = false;
      },
      submitActivityOut() {
         // Validación
         this.activityErrors.title = !this.activityTitle.trim();
         this.activityErrors.description = !this.activityDescription.trim();

         if (this.activityErrors.title || this.activityErrors.description) {
            return; // no continuar si hay errores
         }

         // Registrar log en la tabla
         this.logs.unshift({
            time: new Date().toLocaleTimeString(),
            reason: `Activity Out: ${this.activityTitle}`,
            description: this.activityDescription,
            color: '#FFAB91'
         });

         // 🔹 Cerrar diálogo
         this.showActivityOutDialog = false;

         // 🔹 Volver a la vista principal
         this.onActivity = false;
         this.onBreak = false;
         this.onLunch = false;
      },
      openDescription(desc) {
         this.selectedDescriptionText = desc;
         this.showDescriptionDialog = true;
      },
      closeDescription() {
         this.showDescriptionDialog = false;
         this.selectedDescriptionText = '';
      },
      openDescription(desc, reason) {
         this.selectedDescriptionText = desc
         this.selectedReason = reason
         this.showDescriptionDialog = true
      }




   }




}
</script>
