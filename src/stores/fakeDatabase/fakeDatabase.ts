import type { Lead } from '@/stores/leads/leads'
import type { Customer } from '@/stores/customers/customers'
import type { Department } from '@/stores/departments/departments'

let eventGuid = 0;



export const fakeDatabase = {
    leads: [
        {
            id: 1,
            name: 'Daniel',
            lastName: 'Pérez',
            source: 'Facebook Ads',
            location: 'Mérida',
            age: 28,
            programsOffered: [{ id: 1, name: 'Starter Plan', price: 100 }],
            programsSold: [],
            notes: 'Requested info about payment plans.',
            reminder: '2025-05-15',
            phone: '+52 999 000 1111',
            email: 'daniel@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'LEAD',
            notSoldReason: '',
            lost: false,
            dealWon: false
        },
        {
            /* DEAL OPEN */
            id: 2,
            name: 'María',
            lastName: 'López',
            source: 'Referral',
            location: 'Cancún',
            age: 35,
            programsOffered: [{ id: 2, name: 'Pro Plan', price: 300 }],
            programsSold: [{ id: 2, name: 'Pro Plan', price: 300 }],
            notes: 'Interested in upgrade.',
            reminder: '2025-06-01',
            phone: '+52 998 123 4567',
            email: 'maria@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'DEAL',
            notSoldReason: '',
            lost: false,
            dealWon: false
        },
        {
            id: 3,
            name: 'Luis',
            lastName: 'Martínez',
            source: 'Google Ads',
            location: 'CDMX',
            age: 40,
            programsOffered: [{ id: 1, name: 'Starter Plan', price: 100 }],
            programsSold: [],
            notes: 'Did not follow up.',
            reminder: '',
            phone: '+52 555 987 6543',
            email: 'luis@example.com',
            language: 'English',
            followUp: [],
            assignedTo: [],
            type: 'LEAD',
            notSoldReason: 'No response',
            lost: true,
            dealWon: false
        },
        {
            id: 4,
            name: 'Ana',
            lastName: 'Ramírez',
            source: 'LinkedIn',
            location: 'Monterrey',
            age: 32,
            programsOffered: [{ id: 3, name: 'Enterprise Plan', price: 500 }],
            programsSold: [],
            notes: 'Follow-up scheduled.',
            reminder: '2025-05-20',
            phone: '+52 818 555 1122',
            email: 'ana@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'CONTACT',
            notSoldReason: '',
            lost: false,
            dealWon: false
        },
        {
            /* DEAL LOST */
            id: 5,
            name: 'Pedro',
            lastName: 'Sánchez',
            source: 'Event',
            location: 'Guadalajara',
            age: 45,
            programsOffered: [{ id: 2, name: 'Pro Plan', price: 300 }],
            programsSold: [],
            notes: 'Budget issues.',
            reminder: '',
            phone: '+52 333 222 3344',
            email: 'carlos@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'DEAL',
            notSoldReason: 'Budget too high',
            lost: true,
            dealWon: false
        },
        {
            id: 6,
            name: 'Daniel',
            lastName: 'Pérez',
            source: 'Facebook Ads',
            location: 'Mérida',
            age: 28,
            programsOffered: [
                { id: 1, name: 'Starter Plan', price: 100 },
                { id: 1, name: 'Starter Plan', price: 100 }
            ],
            programsSold: [
                { id: 2, name: 'Pro Plan', price: 300 },
                { id: 2, name: 'Pro Plan', price: 300 }
            ],
            notes: 'Requested info about payment plans.',
            reminder: '2025-05-15',
            phone: '+52 999 000 1111',
            phone2: '+52 999 222 3333',
            email: 'daniel@example.com',
            language: 'Spanish',
            otherLanguage: 'English',
            followUp: [
                {
                    date: '2025-05-10',
                    time: '15:30',
                    employee: {
                        name: 'Mario',
                        lastName: 'Gómez',
                        employeeNumber: 'EMP045'
                    }
                },
                {
                    date: '2025-05-12',
                    time: '10:00',
                    employee: {
                        name: 'Laura',
                        lastName: 'Flores',
                        employeeNumber: 'EMP046'
                    }
                }
            ],
            assignedTo: [
                {
                    name: 'Mario',
                    lastName: 'Gómez',
                    employeeNumber: 'EMP045'
                },
                {
                    name: 'Laura',
                    lastName: 'Flores',
                    employeeNumber: 'EMP046'
                }
            ],
            type: 'LEAD',
            notSoldReason: '',
            lost: false,
            dealWon: false
        },
        {
            /* DEAL OPEN */
            id: 7,
            name: 'Carlos',
            lastName: 'Sánchez',
            source: 'Event',
            location: 'Guadalajara',
            age: 45,
            programsOffered: [{ id: 2, name: 'Pro Plan', price: 300 }],
            programsSold: [],
            notes: 'Budget issues.',
            reminder: '',
            phone: '+52 333 222 3344',
            email: 'carlos@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'DEAL',
            notSoldReason: 'Budget too high',
            lost: false,
            dealWon: false
        },
        {
            /* DEAL WON */
            id: 8,
            name: 'Laura',
            lastName: 'Torres',
            source: 'Instagram',
            location: 'Tijuana',
            age: 30,
            programsOffered: [{ id: 4, name: 'Custom Plan', price: 200 }],
            programsSold: [{ id: 4, name: 'Custom Plan', price: 200 }],
            notes: 'Closed the deal.',
            reminder: '',
            phone: '+52 664 111 2233',
            email: 'laura@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'DEAL',
            notSoldReason: '',
            lost: false,
            dealWon: true
        },
        {
            id: 9,
            name: 'Cristina',
            lastName: 'Ramírez',
            source: 'LinkedIn',
            location: 'Monterrey',
            age: 32,
            programsOffered: [{ id: 3, name: 'Enterprise Plan', price: 500 }],
            programsSold: [],
            notes: 'Follow-up scheduled.',
            reminder: '2025-05-20',
            phone: '+52 818 555 1122',
            email: 'ana@example.com',
            language: 'Spanish',
            followUp: [],
            assignedTo: [],
            type: 'CONTACT',
            notSoldReason: '',
            lost: true,
            dealWon: false
        },
    ] as Lead[],


    
      customers: 
        [
    {
        uuid: '0c468ec6-2f43-4596-b3ce-f95c81e307ab',
        code: 'C001',
        name: 'Juan Pérez',
        description: 'Cliente importante'
    },
    {
        uuid: '64810439-c652-4050-95c5-79d90c11b7c9',
        code: 'C002',
        name: 'Pato Pérez',
        description: 'Cliente normal'
    },
    {
        uuid: 'ebc41966-e682-4390-9620-652770fa0fbb',
        code: 'C003',
        name: 'Emilio Pérez',
        description: 'Cliente normal'
    }


 
  ] as Customer[],
departments: [
  {
    uuid: '1977be48-4cf1-413e-b646-c3e9a7ff2126',
    name: 'Recursos Humanos',
    description: 'Departamento encargado de la gestión del personal'
  },
  {
    uuid: 'b2101bc0-da58-4be3-8d32-0d9fed81a731',
    name: 'Ventas',
    description: 'Departamento encargado de las ventas'
  },
  {
    uuid: 'cbf72a37-7331-4f78-baf4-68e7f030caf3',
    name: 'Contabilidad',
    description: 'Departamento encargado de las finanzas'
  }
] as Department[]


}





function createEventId() {
    return String(eventGuid++);
}