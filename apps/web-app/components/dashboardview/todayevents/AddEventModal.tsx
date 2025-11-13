'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Plus, X } from 'lucide-react'
import type { Event } from '@/lib/calendarData'
import { Badge } from '@workspace/ui/components/badge'

interface AddEventModalProps {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  onAddEvent: (event: Omit<Event, 'id'>) => void
}

const colors = [
  { name: 'Azul', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Verde', value: 'green', bg: 'bg-green-500' },
  { name: 'Morado', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Naranja', value: 'orange', bg: 'bg-orange-500' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-500' },
  { name: 'Rojo', value: 'red', bg: 'bg-red-500' },
]

const categories = ['Clima', 'Mantenimiento', 'Sanidad', 'Seguridad', 'Otro']

const availableTags = [
  'Urgente',
  'Importante',
  'Clima',
  'Riego',
  'Fertilización',
  'Seguridad',
]

export function AddEventModal({
  isDialogOpen,
  setIsDialogOpen,
  onAddEvent,
}: AddEventModalProps) {
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    color: colors[0]?.value || 'blue',
    category: categories[0] || 'Clima',
    tags: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      return
    }

    onAddEvent({
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0]?.value || 'blue',
      category: newEvent.category || categories[0] || 'Clima',
      tags: newEvent.tags || [],
    })

    // Resetear el formulario
    setNewEvent({
      title: '',
      description: '',
      color: colors[0]?.value || 'blue',
      category: categories[0] || 'Clima',
      tags: [],
    })
    setIsDialogOpen(false)
  }

  const toggleTag = (tag: string) => {
    const currentTags = newEvent.tags || []
    if (currentTags.includes(tag)) {
      setNewEvent({
        ...newEvent,
        tags: currentTags.filter((t) => t !== tag),
      })
    } else {
      setNewEvent({
        ...newEvent,
        tags: [...currentTags, tag],
      })
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        className="h-6 w-6 rounded-full hover:bg-accent"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Añadir evento</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Añadir nuevo evento</DialogTitle>
              <DialogDescription>
                Completa los campos para crear un nuevo evento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newEvent.title || ''}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Ej: Riesgo de helada"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ''}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Describe el evento..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDateTime">Fecha y hora de inicio</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={
                      newEvent.startTime
                        ? new Date(
                            newEvent.startTime.getTime() -
                              newEvent.startTime.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      setNewEvent({ ...newEvent, startTime: date })
                    }}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDateTime">Fecha y hora de fin</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={
                      newEvent.endTime
                        ? new Date(
                            newEvent.endTime.getTime() -
                              newEvent.endTime.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      setNewEvent({ ...newEvent, endTime: date })
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newEvent.category || categories[0]}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setNewEvent({ ...newEvent, color: color.value })
                      }
                      className={`w-8 h-8 rounded-full ${color.bg} ${
                        newEvent.color === color.value
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2 flex-wrap">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        newEvent.tags?.includes(tag) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {newEvent.tags?.includes(tag) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Añadir evento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
