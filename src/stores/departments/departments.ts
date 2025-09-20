// src/stores/departments/departments.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export interface Department {
  uuid: string
  name: string
  description: string
}
const BASE_URL = import.meta.env.VITE_VOUT_API_URL + '/departments'

export const useDepartmentsStore = defineStore('departments', {
  state: () => ({
    departments: [] as Department[],
    perPage: 5
  }),
  actions: {
  
     async loadData() {
      try {
        const response = await axios.get<Department[]>(BASE_URL)
        this.departments = response.data
      } catch (error) {
        console.error('Error cargando customers desde la API:', error)
        throw error
      }
    },
    async addItem(item: Department) {
      try {
        const response = await axios.post<Department>(BASE_URL, item)
        const newDepartment = response.data
        this.departments.push(newDepartment)
        return newDepartment
      } catch (error) {
        console.error('Error creando department:', error)
        throw error
      }
    },
    async updateItem(uuid: string, updatedItem: Department) {
      try {
    // Hacer PATCH al backend
    const response = await axios.patch<Department>(`${BASE_URL}/${uuid}`, updatedItem)
    const index = this.departments.findIndex(d => d.uuid === uuid);
    if (index !== -1) this.departments[index] = response.data;

    return response.data;
  } catch (error) {
    console.error('Error actualizando department:', error);
    throw error;
  }
    },
async deleteItem(uuid: string) {
  try {
    await axios.delete(`${BASE_URL}/${uuid}`);
    this.departments = this.departments.filter(d => d.uuid !== uuid);
  } catch (error) {
    console.error('Error borrando department:', error);
    throw error; 
  }
},
    setPerPage(n: number) {
      this.perPage = n
    }
  }
})
