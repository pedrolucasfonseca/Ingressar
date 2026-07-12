import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { useCreateEvent, useUpdateEvent } from '../hooks/useOrganizerEvents'
import { useBannerUpload } from '../hooks/useBannerUpload'
import { getErrorMessage } from '../lib/errors'

export function OrganizerForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { data: event } = useEvent(id)
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent(id ?? '')
  const bannerUpload = useBannerUpload(id ?? '')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!event) return
    setTitle(event.title)
    setDescription(event.description)
    setPrice((event.priceCents / 100).toString())
    setDate(event.date.slice(0, 16))
    setCapacity(event.capacity.toString())
    setLocation(event.location)
  }, [event])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const input = {
      title,
      description,
      price: Math.round(parseFloat(price) * 100),
      date: new Date(date).toISOString(),
      capacity: parseInt(capacity, 10),
      location,
    }
    try {
      if (isEditing) {
        await updateEvent.mutateAsync(input)
        navigate('/organizer/events')
      } else {
        const created = await createEvent.mutateAsync(input)
        navigate(`/organizer/events/${created.id}/edit`)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível salvar o evento. Confira os campos.'))
    }
  }

  async function handlePublish() {
    await updateEvent.mutateAsync({ status: 'published' })
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await bannerUpload.mutateAsync(file)
    } catch {
      // erro exibido via bannerUpload.error abaixo
    }
  }

  const saving = createEvent.isPending || updateEvent.isPending

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl">{isEditing ? 'Editar evento' : 'Novo evento'}</h1>

      {isEditing && (
        <div className="mt-6">
          <label htmlFor="banner" className="block font-mono text-xs uppercase tracking-wide text-perf">
            Banner do evento
          </label>
          {event?.bannerUrl && <img src={event.bannerUrl} alt="" className="mt-2 aspect-video w-full border-2 border-ink object-cover dark:border-ink-dark" />}
          <input
            id="banner"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerChange}
            className="mt-2 font-mono text-sm"
          />
          {bannerUpload.isPending && <p className="mt-1 font-mono text-xs text-perf">Enviando banner...</p>}
          {bannerUpload.isError && (
            <p role="alert" className="mt-1 text-xs text-stamp dark:text-stamp-dark">
              {(bannerUpload.error as Error).message}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="title" className="block font-mono text-xs uppercase tracking-wide text-perf">Título</label>
          <input id="title" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 dark:border-ink-dark" />
        </div>
        <div>
          <label htmlFor="description" className="block font-mono text-xs uppercase tracking-wide text-perf">Descrição</label>
          <textarea id="description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border-2 border-ink bg-transparent p-2 dark:border-ink-dark" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block font-mono text-xs uppercase tracking-wide text-perf">Preço (R$)</label>
            <input id="price" type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 font-mono dark:border-ink-dark" />
          </div>
          <div>
            <label htmlFor="capacity" className="block font-mono text-xs uppercase tracking-wide text-perf">Capacidade</label>
            <input id="capacity" type="number" min="1" required value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 font-mono dark:border-ink-dark" />
          </div>
        </div>
        <div>
          <label htmlFor="date" className="block font-mono text-xs uppercase tracking-wide text-perf">Data e hora</label>
          <input id="date" type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 font-mono dark:border-ink-dark" />
        </div>
        <div>
          <label htmlFor="location" className="block font-mono text-xs uppercase tracking-wide text-perf">Local</label>
          <input id="location" required minLength={3} value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 dark:border-ink-dark" />
        </div>

        {error && <p role="alert" className="text-sm text-stamp dark:text-stamp-dark">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} aria-busy={saving} className="flex-1 border-2 border-ink bg-stamp py-3 font-mono font-medium text-paper disabled:opacity-60 dark:border-ink-dark">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          {isEditing && event?.status === 'draft' && (
            <button type="button" onClick={handlePublish} disabled={saving} className="flex-1 border-2 border-stub py-3 font-mono font-medium text-stub dark:border-stub-dark dark:text-stub-dark">
              Publicar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
