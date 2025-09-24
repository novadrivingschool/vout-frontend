<template>
   <v-container>
      <v-card class="pa-4 elevation-2 rounded">
         <!-- Headers -->
         <v-row align="center" justify="space-between" class="mb-2">
            <h2 class="text-tittle-2 mb-0 ma-15 ">Departments</h2>
            <v-btn color="orange darken-2 mb-0 ma-15" dark small @click="openDialog">
               ADD DEPARTMENT
            </v-btn>
         </v-row>

         <!-- Table -->
         <GenericTable :headers="headers" :items="departments" :perPage="departmentsStore.perPage" @edit="editItem"
            @delete="openDeleteDialog" @update:perPage="departmentsStore.setPerPage" />

         <!-- Form -->
         <GenericFormDialog :fields="fields" :modelValue="selectedItem" v-model:visible="dialogVisible"
            @submit="saveItem" />

         <!-- Open delete confirmation dialog -->
         <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
               <v-card-title class="text-h6 ml-7">Are you sure?</v-card-title>
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



<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import GenericTable from '@/components/GenericTable/GenericTable.vue'
import GenericFormDialog from '@/components/GenericFormDialog/GenericFormDialog.vue'
import { useDepartmentsStore } from '@/stores/departments/departments'
import { definePage } from 'vue-router/auto'

definePage({ meta: { requiresAuth: true, roles: ['admin'] } })

const departmentsStore = useDepartmentsStore()
const { departments } = storeToRefs(departmentsStore) // reactivo

// Load data
onMounted(() => {
   departmentsStore.loadData()
})

// Table
const headers = [
   { title: 'Name', key: 'name' },
   { title: 'Description', key: 'description' },
   { title: 'Actions', key: 'actions', sortable: false }
]

// Forms
const fields = [
   { label: 'Name', key: 'name', required: true },
   { label: 'Description', key: 'description', required: true }
]

// Dialogs
const dialogVisible = ref(false)
const selectedItem = ref({})
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)

// Open form, new register
const openDialog = () => {
   selectedItem.value = {}
   dialogVisible.value = true
}

// EDIT item
const editItem = (item: any) => {
   selectedItem.value = { ...item }
   dialogVisible.value = true
}

// SAVE Department
const saveItem = (item: any) => {
   if (!item.name || !item.description) {
      alert('All fields are required')
      return
   }


   const payload = {
      uuid: item.uuid ,
      name: item.name,
      description: item.description
   }
console.log('Payload to save:', payload)
   if (item.uuid) {
      departmentsStore.updateItem( item.uuid, payload)
   } else {
      departmentsStore.addItem(payload)
   }

   dialogVisible.value = false
}



const deleteUuid = ref<string | null>(null)


const openDeleteDialog = (uuid: string | undefined) => {
  if (uuid) {
    deleteUuid.value = uuid
    deleteDialog.value = true
  } else {
    alert('Invalid UUID for deletion')
  }
}

// Confirm deletion
const confirmDelete = async () => {
  if (deleteUuid.value) {
    try {
      
      await departmentsStore.deleteItem(deleteUuid.value)

      deleteDialog.value = false
      deleteUuid.value = null
    } catch (error) {
      console.error('Error borrando department:', error)
      alert('Failed to delete department')
    }
  }
}


</script>