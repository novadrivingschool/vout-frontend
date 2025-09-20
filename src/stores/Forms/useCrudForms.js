import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCrudForms = defineStore('crudForms', () => {
  const items = ref([])
  const loading = ref(false)
  const perPage = ref(5)

  const fetchItems = (data = []) => {
    items.value = data
  }

  const addItem = (item) => {
    items.value.push({ ...item, id: Date.now() })
  }

  const updateItem = (id, newItem) => {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = { ...items.value[index], ...newItem }
  }

  const deleteItem = (id) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  const setPerPage = (n) => {
    perPage.value = n === 'All' ? items.value.length : n
  }

  return { items, loading, perPage, fetchItems, addItem, updateItem, deleteItem, setPerPage }
})
