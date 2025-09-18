// src/stores/customers/customers.ts
import { defineStore } from 'pinia'
import axios from 'axios'

import { fakeDatabase } from '../fakeDatabase/fakeDatabase'

const BASE_URL = import.meta.env.VITE_VOUT_API_URL + '/customers'
export interface Customer {
  uuid: string
  code: string
  name: string
  description: string
}

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [] as Customer[],
    perPage: 5
  }),
  actions: {
   
    async loadData() {
      try {
        const response = await axios.get<Customer[]>(BASE_URL)
        this.customers = response.data
      } catch (error) {
        console.error('Error cargando customers desde la API:', error)
        throw error
      }
    },
async addItem(item: Customer) {
      try {
        const response = await axios.post<Customer>(BASE_URL, item)
        const newCustomer = response.data
        this.customers.push(newCustomer)
        return newCustomer
      } catch (error) {
        console.error('Error creando customer:', error)
        throw error
      }
    },

    async updateItem(uuid: string, updatedItem: Customer) {
      try {
        const response = await axios.patch<Customer>(`${BASE_URL}/${uuid}`, updatedItem)
        const index = this.customers.findIndex(c => c.uuid === uuid)
        if (index !== -1) this.customers[index] = response.data

        return response.data
      } catch (error) {
        console.error('Error actualizando customer:', error)
        throw error
      }
    },

    async deleteItem(uuid: string) {
      try {
        await axios.delete(`${BASE_URL}/${uuid}`)
        this.customers = this.customers.filter(c => c.uuid !== uuid)
      } catch (error) {
        console.error('Error borrando customer:', error)
        throw error
      }
    },

    setPerPage(n: number) {
      this.perPage = n
    }
  }
})
