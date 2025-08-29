<template>
  <v-data-table
    :headers="props.headers"
    :items="props.items"
    :items-per-page="perPage"
    class="elevation-0"
    density="comfortable"
    :footer-props="{ 'items-per-page-options': [5, 10, { text: 'All', value: -1 }] }"
    style="min-height: 200px;"
    show-header
    @update:items-per-page="setPerPage"
  >
    <template #item.actions="{ item }">
      <v-icon small class="mr-2" color="blue" @click="$emit('edit', item)">
        mdi-pencil
      </v-icon>
      <v-icon small color="red" @click="$emit('delete', item.id)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>


<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  perPage: { type: Number, required: true },
})

const emit = defineEmits(['edit', 'delete', 'update:perPage'])

// Ref local para controlar la paginación
const perPageLocal = ref(5) // inicializa en 5 registros por página

const setPerPage = (n) => emit('update:perPage', n)

// Emitimos al padre cada vez que cambie perPageLocal
watch(perPageLocal, (val) => emit('update:perPage', val))
</script>
