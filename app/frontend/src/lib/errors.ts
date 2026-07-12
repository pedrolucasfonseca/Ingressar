export function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  const error = (data as { error?: unknown })?.error
  return typeof error === 'string' ? error : fallback
}
