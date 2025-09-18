<template>
   <v-container>
      <v-card class="pa-4 elevation-2 rounded">
         <!-- Header -->
         <v-row align="center" justify="space-between" class="mb-2">
            <h2 class="text-tittle-2 mb-0 ma-15 ml-7">Customers</h2>
            <v-btn color="orange darken-2 mb-0 ma-15" dark small @click="openDialog">
               ADD CUSTOMER
            </v-btn>
         </v-row>

         <!-- Table -->
         <GenericTable :headers="headers" :items="customers" :perPage="customersStore.perPage" @edit="editItem"
            @delete="openDeleteDialog" @update:perPage="customersStore.setPerPage" />

         <!-- Forms -->
         <GenericFormDialog :fields="fields" :modelValue="selectedItem" v-model:visible="dialogVisible"
            @submit="saveItem" />

         <!-- deletion confirmation message-->
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
import  GenericTable  from '@/components/GenericTable/GenericTable.vue'
import GenericFormDialog from '@/components/GenericFormDialog/GenericFormDialog.vue'

import { useCustomersStore } from '@/stores/customers/customers' 
const customersStore = useCustomersStore()
const { customers } = storeToRefs(customersStore)

onMounted(() => {
   customersStore.loadData()
})


// TABLE
const headers = [
   { title: 'Zoho Code', key: 'code' },
   { title: 'Name', key: 'name' },
   { title: 'Description', key: 'description' },
   { title: 'Actions', key: 'actions', sortable: false }
]

const fields = [
   { label: 'Zoho code', key: 'code', required: true },
   { label: 'Name', key: 'name', required: true },
   { label: 'Description', key: 'description', required: true }
]

const dialogVisible = ref(false)
const selectedItem = ref({})
const deleteDialog = ref(false)
const deleteUuid = ref<string | null>(null)

const openDialog = () => {
   selectedItem.value = {} // new register
   dialogVisible.value = true
}

const editItem = (item: any) => {
   selectedItem.value = { ...item }
   dialogVisible.value = true
}

// Save customer
const saveItem = (item: any) => {
   if (!item.name || !item.description) {
      alert('All fields are required')
      return
   }


   const payload = {
      uuid: item.uuid ,
      code: item.code,
      name: item.name,
      description: item.description
   }
//console.log('Payload to save:', payload)
   if (item.uuid) {
      customersStore.updateItem( item.uuid, payload)
   } else {
      payload.uuid = crypto.randomUUID()
      customersStore.addItem(payload)
   }
    //console.log('Payload to save:', payload) 

   dialogVisible.value = false
}


// Abrir confirmación de borrado
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
   
      await customersStore.deleteItem(deleteUuid.value)

    
      deleteDialog.value = false
      deleteUuid.value = null
    } catch (error) {
      console.error('Error borrando department:', error)
      alert('Failed to delete department')
    }
  }
}
</script>
