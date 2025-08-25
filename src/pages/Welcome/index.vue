<template>
   <h1>   Bienvenido al Activity Report  </h1>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLeadsStore } from '@/stores/leads/leads'
import SharedTable from '@/components/TableRecords/SharedTable.vue'

const leadsStore = useLeadsStore()
//leadsStore.loadMockData()
leadsStore.fetchData('LEAD', 'all')

const { leads } = storeToRefs(leadsStore)

</script>
