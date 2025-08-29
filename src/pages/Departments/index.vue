<template>
   <v-container>
      <v-card class="pa-4 elevation-2 rounded">
         <!-- Encabezado -->
         <v-row align="center" justify="space-between" class="mb-2">
            <h2 class="text-tittle-2 mb-0 ma-15">Departments</h2>
            <v-btn color="orange darken-2 mb-0 ma-15" dark small @click="openDialog">
               ADD DEPARTMENT
            </v-btn>
         </v-row>

         <!-- Tabla -->
         <GenericTable
            :headers="headers"
            :items="store.items"
            :perPage="store.perPage"
            @edit="editItem"
            @delete="openDeleteDialog"   
            @update:perPage="store.setPerPage"
         />

         <!-- Formulario -->
         <GenericFormDialog
            :fields="fields"
            :modelValue="selectedItem"
            v-model:visible="dialogVisible"
            @submit="saveItem"
         />

              <!-- 🔥 Diálogo de confirmación de borrado -->
         <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
               <v-card-title class="text-h6">Are you sure?</v-card-title>
               <v-card-text>
                 This action will permanently delete the record.
               </v-card-text>
               <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="deleteDialog = false">Cancel</v-btn>
                  <v-btn color="red" text @click="confirmDelete">Delete</v-btn>
               </v-card-actions>
            </v-card>
         </v-dialog>
      </v-card>
   </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudForms } from '@/stores/Forms/useCrudForms'
import GenericTable from '@/components/GenericTable/GenericTable.vue'
import GenericFormDialog from '@/components/GenericFormDialog/GenericFormDialog.vue'

const store = useCrudForms()

// Definimos las columnas de la tabla
const headers = [
   { title: 'Name', key: 'name' },
   { title: 'Description', key: 'description' },
   { title: 'Actions', key: 'actions', sortable: false }
]


// Definimos los campos del formulario
const fields = [
   { label: 'Name', key: 'name', required: true },
   { label: 'Description', key: 'description', required: true }
]

const dialogVisible = ref(false)
const selectedItem = ref({})

// 🟠 Estados para borrar
const deleteDialog = ref(false)
const deleteId = ref(null)

const openDialog = () => {
   selectedItem.value = {} // nuevo registro
   dialogVisible.value = true
}

const editItem = (item) => {
   selectedItem.value = { ...item }
   dialogVisible.value = true
}

const saveItem = (item) => {
   // Validación simple
   if (!item.name || !item.description) {
      // Mostramos el error, pero no cerramos el diálogo
      alert('All fields are required')
      return // IMPORTANTE: salimos aquí antes de guardar
   }

   // Si pasó la validación, guardamos y cerramos
   if (item.id) {
      store.updateItem(item.id, item)
   } else {
      store.addItem(item)
   }
   dialogVisible.value = false // Cerramos el diálogo solo después de guardar correctamente
}


// 🟠 Abrir confirmación de borrado
function openDeleteDialog(id) {
   deleteId.value = id
   deleteDialog.value = true
}

// 🟠 Confirmar borrado
function confirmDelete() {
   if (deleteId.value) {
      store.deleteItem(deleteId.value)
   }
   deleteDialog.value = false
   deleteId.value = null
}

// Datos iniciales de prueba
onMounted(() => {
   store.fetchItems([
      { id: 1, name: 'Sales Department', description: 'Handles sales operations' },
      { id: 2, name: 'Accounting Department', description: 'Manages accounts' }
   ])
})
</script>
