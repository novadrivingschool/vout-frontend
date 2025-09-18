<template>
  <v-dialog v-model="internalVisible" max-width="500px" persistent>
    <v-card>
      <v-card-title>{{ isEdit ? 'Edit' : 'Add' }}</v-card-title>

      <v-card-text>
        <v-form ref="formRef">
          <v-text-field
            v-for="field in fields"
            :key="field.key"
            v-model="formData[field.key]"
            :label="field.label"
            :error="errors[field.key]"
            :error-messages="errors[field.key] ? ['Required'] : []"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancel">Cancel</v-btn>
        <v-btn color="orange" dark @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'

/* ---------- Tipos ---------- */
interface Field {
  key: string
  label: string
  required?: boolean
}

type FormData = Record<string, any>
type Errors = Record<string, boolean>

/* ---------- Props ---------- */
const props = defineProps<{
  fields: Field[]
  modelValue?: FormData
  visible?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: FormData): void
  (e: 'update:visible', value: boolean): void
}>()

/* ---------- Refs y estado ---------- */
const formRef = ref<HTMLFormElement | null>(null)
const formData = reactive<FormData>({})
const internalVisible = ref<boolean>(props.visible ?? false)
const errors = reactive<Errors>({})

/* ---------- Watches ---------- */
// Sincroniza prop con el ref interno
watch(() => props.visible, (val) => {
  if (val !== undefined) internalVisible.value = val
})

// Emitimos cambios al padre
watch(internalVisible, (val) => {
  emit('update:visible', val)
})

// Determina si estamos editando o creando
const isEdit = computed(() => !!props.modelValue?.uuid)

// Carga datos del modelValue al abrir
watch(
  () => props.modelValue,
  (val) => {
    if (val) Object.assign(formData, val)
  },
  { immediate: true }
)

// Limpiar el formulario al abrir en modo Add
watch(internalVisible, (val) => {
  if (val && !isEdit.value) {
    props.fields.forEach(f => (formData[f.key] = ''))
    props.fields.forEach(f => (errors[f.key] = false))
  }
})

/* ---------- Métodos ---------- */
const save = () => {
  let hasError = false
  Object.keys(errors).forEach(key => (errors[key] = false))

  props.fields.forEach(f => {
    if (f.required && !formData[f.key]) {
      errors[f.key] = true
      hasError = true
    }
  })

  if (hasError) return

  emit('submit', { ...formData })
  internalVisible.value = false
}

const cancel = () => {
  internalVisible.value = false
}
</script>
