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
            :error-messages="errors[field.key] ? ['Campo obligatorio'] : []"
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

<script setup>
import { reactive, ref, watch, computed } from 'vue'

const props = defineProps({
  fields: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({}) },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const formData = reactive({})
const internalVisible = ref(props.visible)
const errors = reactive({}) // <-- agregamos errores por campo

// Sincroniza prop con el ref interno
watch(() => props.visible, (val) => {
  internalVisible.value = val
})

// Emitimos cambios al padre
watch(internalVisible, (val) => {
  emit('update:visible', val)
})

// Determina si estamos editando o creando
const isEdit = computed(() => !!props.modelValue.id)

// Carga datos del modelValue al abrir
watch(
  () => props.modelValue,
  (val) => {
    Object.assign(formData, val)
  },
  { immediate: true }
)

// Limpiar el formulario al abrir en modo Add
watch(internalVisible, (val) => {
  if (val && !isEdit.value) {
    props.fields.forEach(f => formData[f.key] = '')
    // Limpiamos errores
    props.fields.forEach(f => errors[f.key] = false)
  }
})

const save = () => {
  let hasError = false

  // Limpiamos errores anteriores
  Object.keys(errors).forEach(key => (errors[key] = false))

  // Validación de campos requeridos
  props.fields.forEach(f => {
    if (f.required && !formData[f.key]) {
      errors[f.key] = true
      hasError = true
    }
  })

  if (hasError) {
    return // ⚠ No emitimos submit, el diálogo permanece abierto
  }

  // Emitimos solo si todo está correcto
  emit('submit', { ...formData })
  internalVisible.value = false
}

const cancel = () => {
  internalVisible.value = false
}
</script>
