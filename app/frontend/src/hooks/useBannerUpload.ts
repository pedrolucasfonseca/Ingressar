import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function useBannerUpload(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Formato não suportado — use JPEG, PNG ou WebP')
      }
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error('Arquivo maior que 5MB')
      }

      const { data } = await api.post(`/events/${eventId}/banner-upload-url`, { contentType: file.type })
      const uploadRes = await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!uploadRes.ok) {
        throw new Error('Falha ao enviar o arquivo para o armazenamento. Tente novamente.')
      }
      await api.patch(`/events/${eventId}`, { bannerUrl: data.publicUrl })
      return data.publicUrl as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}
