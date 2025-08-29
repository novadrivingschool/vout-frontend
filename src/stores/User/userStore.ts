import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Users Name', // temporal, luego vendrá del login real
  }),
  getters: {
    greeting(): string {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) return 'Good Morning'
      if (hour >= 12 && hour < 18) return 'Good Afternoon'
      return 'Good Evening'
    },
    greetingIcon(): string {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) return 'mdi-weather-sunny'
      if (hour >= 12 && hour < 18) return 'mdi-weather-partly-cloudy'
      return 'mdi-weather-night'
    }
  },
  actions: {
    setName(newName: string) {
      this.name = newName
    }
  }
})
