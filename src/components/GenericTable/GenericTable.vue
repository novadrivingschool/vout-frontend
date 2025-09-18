<template>
  <v-data-table
    :headers="props.headers"
    :items="props.items"
    :items-per-page="props.perPage"
    class="elevation-0"
    density="comfortable"
    :footer-props="{ 'items-per-page-options': [5, 10, { text: 'All', value: -1 }] }"
    style="min-height: 200px;"
    show-header
    @update:items-per-page="setPerPage"
  >
    <template #item.actions="{ item }">
      <v-icon small class="mr-2" color="blue" @click="emit('edit', item)">
        mdi-pencil
      </v-icon>
      <v-icon small color="red" @click="emit('delete', item?.uuid)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
type Align = 'start' | 'end' | 'center'

interface Header {
  title: string
  key: string
  sortable?: boolean
  align?: Align
  width?: string | number
}

// Tipo base que asegura que cada fila tenga id opcional
type RowBase = { uuid?: string  }

const props = defineProps<{
  headers: Header[]
  items: RowBase[]   // puede ser Department[], Customer[], etc.
  perPage: number
}>()

const emit = defineEmits<{
  (e: 'edit', item: RowBase): void
  (e: 'delete', uuid: RowBase['uuid']): void
  (e: 'update:perPage', value: number): void
}>()

const setPerPage = (n: number) => emit('update:perPage', n)
</script>
