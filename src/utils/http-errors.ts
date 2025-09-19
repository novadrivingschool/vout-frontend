import type { AxiosError } from 'axios'

type MessagesByStatus = Partial<Record<number, string>> & { default?: string }

export function explainAxiosError(error: unknown, messages?: MessagesByStatus): string {
  const fallback = messages?.default ?? 'An error occurred. Please try again.'

  const axErr = error as AxiosError<any>

  // No response => network/timeout/CORS
  if (!axErr?.response) {
    if (axErr?.code === 'ECONNABORTED') return 'The request took too long. Please try again.'
    return 'No connection to the server. Check your network and try again.'
  }

  const status = axErr.response.status

  // Custom message by status if provided
  if (messages && messages[status]) return messages[status] as string

  // Backend-provided message if present
  const data = axErr.response.data
  if (data) {
    if (typeof data === 'string') return data
    if (typeof data.message === 'string') return data.message
    if (Array.isArray(data.message)) return data.message.join(', ')
  }

  // Sensible defaults
  if (status === 401) return 'Unauthorized.'
  if (status === 403) return 'Access denied.'
  if (status === 422) return 'Invalid data.'
  if (status >= 500) return 'Server error.'

  return fallback
}
