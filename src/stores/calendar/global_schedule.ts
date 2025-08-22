// src/stores/global_schedule.ts
import { defineStore } from 'pinia'
import { fakeDatabase } from '@/stores/fakeDatabase/fakeDatabase';

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  allDay?: boolean
  color?: string
  person?: string
}

let eventGuid = 0
function createEventId(): string {
  return String(eventGuid++)
}

// Fechas base dinámicas (hoy)
const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()
const d = today.getDate()

/* const INITIAL_EVENTS: CalendarEvent[] = [
  // Silvia
  {
    id: createEventId(),
    title: 'Evento 1 de Silvia',
    start: new Date(y, m, d + 1, 10),
    end: new Date(y, m, d + 1, 11),
    allDay: true,
    color: '#635BFF',
    person: 'Silvia',
  },
  {
    id: createEventId(),
    title: 'Evento 2 de Silvia',
    start: new Date(y, m, d + 2, 13),
    end: new Date(y, m, d + 2, 14),
    allDay: true,
    color: '#8e24aa',
    person: 'Silvia',
  },
  {
    id: createEventId(),
    title: 'Evento 3 de Silvia',
    start: new Date(y, m, d + 3, 9),
    end: new Date(y, m, d + 3, 10),
    allDay: true,
    color: '#5e35b1',
    person: 'Silvia',
  },

  // Luis
  {
    id: createEventId(),
    title: 'Evento 1 de Luis',
    start: new Date(y, m, d + 1, 14),
    end: new Date(y, m, d + 1, 15),
    allDay: true,
    color: '#13DEB9',
    person: 'Luis',
  },
  {
    id: createEventId(),
    title: 'Evento 2 de Luis',
    start: new Date(y, m, d + 3, 11),
    end: new Date(y, m, d + 3, 12),
    allDay: true,
    color: '#00bcd4',
    person: 'Luis',
  },
  {
    id: createEventId(),
    title: 'Evento 3 de Luis',
    start: new Date(y, m, d + 4, 16),
    end: new Date(y, m, d + 4, 17),
    allDay: true,
    color: '#4caf50',
    person: 'Luis',
  },

  // Mónica
  {
    id: createEventId(),
    title: 'Evento 1 de Mónica',
    start: new Date(y, m, d + 2, 8),
    end: new Date(y, m, d + 2, 9),
    allDay: true,
    color: '#1a97f5',
    person: 'Mónica',
  },
  {
    id: createEventId(),
    title: 'Evento 2 de Mónica',
    start: new Date(y, m, d + 4, 12),
    end: new Date(y, m, d + 4, 13),
    allDay: true,
    color: '#f44336',
    person: 'Mónica',
  },
  {
    id: createEventId(),
    title: 'Evento 3 de Mónica',
    start: new Date(y, m, d + 5, 15),
    end: new Date(y, m, d + 5, 16),
    allDay: true,
    color: '#ff9800',
    person: 'Mónica',
  },

  // Carlos
  {
    id: createEventId(),
    title: 'Evento 1 de Carlos',
    start: new Date(y, m, d + 1, 9),
    end: new Date(y, m, d + 1, 10),
    allDay: true,
    color: '#9c27b0',
    person: 'Carlos',
  },
  {
    id: createEventId(),
    title: 'Evento 2 de Carlos',
    start: new Date(y, m, d + 3, 10),
    end: new Date(y, m, d + 3, 11),
    allDay: true,
    color: '#3f51b5',
    person: 'Carlos',
  },
  {
    id: createEventId(),
    title: 'Evento 3 de Carlos',
    start: new Date(y, m, d + 5, 14),
    end: new Date(y, m, d + 5, 15),
    allDay: true,
    color: '#00acc1',
    person: 'Carlos',
  },

  // Valeria
  {
    id: createEventId(),
    title: 'Evento 1 de Valeria',
    start: new Date(y, m, d + 2, 13),
    end: new Date(y, m, d + 2, 14),
    allDay: true,
    color: '#e91e63',
    person: 'Valeria',
  },
  {
    id: createEventId(),
    title: 'Evento 2 de Valeria',
    start: new Date(y, m, d + 4, 9),
    end: new Date(y, m, d + 4, 10),
    allDay: true,
    color: '#795548',
    person: 'Valeria',
  },
  {
    id: createEventId(),
    title: 'Evento 3 de Valeria',
    start: new Date(y, m, d + 6, 11),
    end: new Date(y, m, d + 6, 12),
    allDay: true,
    color: '#607d8b',
    person: 'Valeria',
  },
  {
    id: createEventId(),
    title: 'Onboarding Silvia',
    start: new Date(y, m, d + 1, 9, 0),
    end: new Date(y, m, d + 1, 10, 30),
    color: '#6a1b9a',
    person: 'Silvia',
  },

  {
    id: createEventId(),
    title: 'Revisión de procesos',
    start: new Date(y, m, d + 2, 14, 0),
    end: new Date(y, m, d + 2, 15, 30),
    color: '#039be5',
    person: 'Luis',
  },

  {
    id: createEventId(),
    title: 'Jornada completa: Curso de liderazgo',
    start: new Date(y, m, d + 3),
    end: new Date(y, m, d + 4),
    allDay: true,
    color: '#ff7043',
    person: 'Carlos',
  },

  {
    id: createEventId(),
    title: 'Entrenamiento técnico',
    start: new Date(y, m, d + 5, 13, 0),
    end: new Date(y, m, d + 5, 17, 0),
    color: '#26a69a',
    person: 'Mónica',
  },

  {
    id: createEventId(),
    title: 'Capacitación: manejo de crisis',
    start: new Date(y, m, d + 6, 10, 0),
    end: new Date(y, m, d + 6, 12, 0),
    color: '#ab47bc',
    person: 'Valeria',
  },

  {
    id: createEventId(),
    title: 'Día libre',
    start: new Date(y, m, d + 7),
    end: new Date(y, m, d + 8),
    allDay: true,
    color: '#c62828',
    person: 'Luis',
  },

  {
    id: createEventId(),
    title: 'Reunión con cliente externo',
    start: new Date(y, m, d + 8, 15, 0),
    end: new Date(y, m, d + 8, 16, 30),
    color: '#5c6bc0',
    person: 'Silvia',
  },

  {
    id: createEventId(),
    title: 'Revisión de KPIs',
    start: new Date(y, m, d + 9, 9, 30),
    end: new Date(y, m, d + 9, 11, 0),
    color: '#00897b',
    person: 'Carlos',
  },

  {
    id: createEventId(),
    title: 'Auditoría interna',
    start: new Date(y, m, d + 10),
    end: new Date(y, m, d + 11),
    allDay: true,
    color: '#fdd835',
    person: 'Mónica',
  },

  {
    id: createEventId(),
    title: 'Desayuno con partners',
    start: new Date(y, m, d + 11, 8, 0),
    end: new Date(y, m, d + 11, 9, 30),
    color: '#ef6c00',
    person: 'Valeria',
  },

  {
    id: createEventId(),
    title: 'Taller de innovación',
    start: new Date(y, m, d + 12, 10, 0),
    end: new Date(y, m, d + 12, 13, 0),
    color: '#43a047',
    person: 'Luis',
  },

  {
    id: createEventId(),
    title: 'Visita de inspección',
    start: new Date(y, m, d + 13, 14, 0),
    end: new Date(y, m, d + 13, 16, 0),
    color: '#3949ab',
    person: 'Carlos',
  },

  {
    id: createEventId(),
    title: 'Conferencia internacional',
    start: new Date(y, m, d + 2),
    end: new Date(y, m, d + 5),
    allDay: true,
    color: '#00897b',
    person: 'Carlos',
  },

  {
    id: createEventId(),
    title: 'Viaje corporativo',
    start: new Date(y, m, d + 6),
    end: new Date(y, m, d + 9),
    allDay: true,
    color: '#f4511e',
    person: 'Luis',
  },

  {
    id: createEventId(),
    title: 'Entrenamiento intensivo de ventas',
    start: new Date(y, m, d + 3),
    end: new Date(y, m, d + 6),
    allDay: true,
    color: '#6a1b9a',
    person: 'Silvia',
  },

  {
    id: createEventId(),
    title: 'Taller de liderazgo',
    start: new Date(y, m, d + 10),
    end: new Date(y, m, d + 12),
    allDay: true,
    color: '#43a047',
    person: 'Mónica',
  },

  {
    id: createEventId(),
    title: 'Jornadas de evaluación',
    start: new Date(y, m, d + 7),
    end: new Date(y, m, d + 10),
    allDay: true,
    color: '#ffb300',
    person: 'Valeria',
  },

  {
    id: createEventId(),
    title: 'Evento de networking empresarial',
    start: new Date(y, m, d + 14),
    end: new Date(y, m, d + 16),
    allDay: true,
    color: '#1e88e5',
    person: 'Silvia',
  },

  // Día específico (27 del mes actual)
  {
    id: createEventId(),
    title: 'Reunión de equipo semanal',
    start: new Date(y, m, 27, 9, 0),
    end: new Date(y, m, 27, 10, 0),
    color: '#1976d2',
    person: 'Silvia',
  },
  {
    id: createEventId(),
    title: 'Llamada con cliente internacional',
    start: new Date(y, m, 27, 10, 30),
    end: new Date(y, m, 27, 11, 15),
    color: '#00acc1',
    person: 'Luis',
  },
  {
    id: createEventId(),
    title: 'Taller de innovación',
    start: new Date(y, m, 27, 13, 0),
    end: new Date(y, m, 27, 15, 0),
    color: '#43a047',
    person: 'Mónica',
  },
  {
    id: createEventId(),
    title: 'Almuerzo con directivos',
    start: new Date(y, m, 27, 12, 0),
    end: new Date(y, m, 27, 13, 0),
    color: '#fb8c00',
    person: 'Carlos',
  },
  {
    id: createEventId(),
    title: 'Evaluación de desempeño',
    start: new Date(y, m, 27, 15, 30),
    end: new Date(y, m, 27, 16, 30),
    color: '#8e24aa',
    person: 'Valeria',
  },
  {
    id: createEventId(),
    title: 'Actividad recreativa',
    start: new Date(y, m, 27, 17, 0),
    end: new Date(y, m, 27, 18, 30),
    color: '#6d4c41',
    person: 'Luis',
  },
  {
    id: createEventId(),
    title: 'Revisión mensual de métricas',
    start: new Date(y, m, 27, 8, 0),
    end: new Date(y, m, 27, 9, 0),
    color: '#f44336',
    person: 'Silvia',
  },
  {
    id: createEventId(),
    title: 'Webinar externo',
    start: new Date(y, m, 27, 19, 0),
    end: new Date(y, m, 27, 20, 0),
    color: '#5e35b1',
    person: 'Carlos',
  },
] */

const INITIAL_EVENTS: CalendarEvent[] = fakeDatabase.INITIAL_EVENTS;

export const useGlobalSchedule = defineStore('global_schedule', {
  state: () => ({
    //events: [...INITIAL_EVENTS] as CalendarEvent[],
    events: [] as CalendarEvent[],
  }),
  getters: {
    eventsByPerson: (state) => (person: string) =>
      state.events.filter((e) => e.person === person),
  },
  actions: {
    /* addEvent(evt: Omit<CalendarEvent, 'id'> & { id?: string }) {
        const id = evt.id ?? createEventId()
        this.events.push({ ...evt, id })
    },
    editEvent(id: string, patch: Partial<CalendarEvent>) {
        const idx = this.events.findIndex((e) => e.id === id)
        if (idx !== -1) {
            this.events[idx] = { ...this.events[idx], ...patch, id }
        }
    }, */
    addEvent(evt: Omit<CalendarEvent, 'id'> & { id?: string }) {
      const id = evt.id ?? createEventId()
      this.events.push({ ...evt, id })
      return id;               // 👈 DEVUELVE EL ID
    },
    editEvent(id: string, patch: Partial<CalendarEvent>) {
      const idx = this.events.findIndex((e) => e.id === id)
      if (idx !== -1) {
        this.events[idx] = { ...this.events[idx], ...patch, id }
        return true            // 👈 indica éxito
      }
      return false
    },
    /* deleteEvent(id: string) {
      this.events = this.events.filter((e) => e.id !== id)
    }, */
    deleteEvent(id: string) {
      const before = this.events.length
      this.events = this.events.filter(e => e.id !== id)
      return this.events.length < before   // true si borró
    },
    clearAll() {
      this.events = []
    },
    /* reset() {
      this.events = [...INITIAL_EVENTS]
    }, */
    // dentro de actions: { ... }
    getAll(): CalendarEvent[] {
      // devuelve una copia para evitar mutaciones externas
      return this.events.slice()
    },

    getByPerson(person: string): CalendarEvent[] {
      return this.events.filter(e => e.person === person)
    },
  },
})
