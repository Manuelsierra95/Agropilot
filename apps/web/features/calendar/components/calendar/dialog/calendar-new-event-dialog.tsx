import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { format } from "date-fns"
import { DateTimePicker } from "@workspace/web/components/form/date-time-picker"

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType =
  | "irrigation"
  | "treatment"
  | "fertilization"
  | "inspection"
  | "alert"
type Priority = "low" | "medium" | "high"

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_TYPES: {
  value: EventType
  label: string
  icon: string
  activeClass: string
}[] = [
  {
    value: "irrigation",
    label: "Riego",
    icon: "💧",
    activeClass:
      "border-blue-400 bg-blue-400/10 dark:border-blue-400 dark:bg-blue-400/15",
  },
  {
    value: "treatment",
    label: "Tratamiento",
    icon: "🧪",
    activeClass:
      "border-red-400 bg-red-400/10 dark:border-red-400 dark:bg-red-400/15",
  },
  {
    value: "fertilization",
    label: "Fertilización",
    icon: "🌱",
    activeClass:
      "border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/15",
  },
  {
    value: "inspection",
    label: "Inspección",
    icon: "🔍",
    activeClass:
      "border-yellow-400 bg-yellow-400/10 dark:border-yellow-300 dark:bg-yellow-300/15",
  },
  {
    value: "alert",
    label: "Alerta",
    icon: "⚠️",
    activeClass:
      "border-orange-400 bg-orange-400/10 dark:border-orange-300 dark:bg-orange-300/15",
  },
]

const PARCELS = [
  { id: "parcel-1", name: "Olivar La Loma" },
  { id: "parcel-2", name: "Finca El Cerro" },
]

const PRIORITIES: { value: Priority; label: string; activeClass: string }[] = [
  {
    value: "low",
    label: "Baja",
    activeClass:
      "border-green-500 bg-green-500/10 text-green-700 dark:border-green-400 dark:bg-green-400/15 dark:text-green-400",
  },
  {
    value: "medium",
    label: "Media",
    activeClass:
      "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-400/15 dark:text-yellow-400",
  },
  {
    value: "high",
    label: "Alta",
    activeClass:
      "border-red-500 bg-red-500/10 text-red-700 dark:border-red-400 dark:bg-red-400/15 dark:text-red-400",
  },
]

const TYPE_COLOR_MAP: Record<EventType, string> = {
  irrigation: "blue",
  treatment: "red",
  fertilization: "green",
  inspection: "yellow",
  alert: "orange",
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio"),
    type: z.enum([
      "irrigation",
      "treatment",
      "fertilization",
      "inspection",
      "alert",
    ]),
    parcelId: z.string().min(1, "Selecciona una parcela"),
    start: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de inicio inválida",
      }),
    end: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de fin inválida",
      }),
    priority: z.enum(["low", "medium", "high"]),
    notes: z.string().optional(),
    waterAmount: z.string().optional(),
    product: z.string().optional(),
    dose: z.string().optional(),
  })
  .refine(
    (data) => {
      try {
        return new Date(data.end) >= new Date(data.start)
      } catch {
        return false
      }
    },
    { message: "La fecha de fin debe ser posterior al inicio", path: ["end"] }
  )

type FormValues = z.infer<typeof formSchema>

// ─── Shared Tailwind strings ──────────────────────────────────────────────────

const sectionLabel =
  "text-[0.68rem] font-bold uppercase tracking-widest text-muted-foreground"

const baseBtn = [
  "transition-all duration-150 cursor-pointer font-[inherit]",
  "border-[1.5px] border-border bg-card text-foreground",
  "hover:bg-accent hover:border-ring",
].join(" ")

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } =
    useCalendarContext()

  const isMobile = useIsMobile()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "irrigation",
      parcelId: "",
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
      priority: "medium",
      notes: "",
      waterAmount: "",
      product: "",
      dose: "",
    },
  })

  const selectedType = useWatch({ control: form.control, name: "type" })

  function onSubmit(values: FormValues) {
    const parcel = PARCELS.find((p) => p.id === values.parcelId)
    const meta: Record<string, unknown> = { priority: values.priority }
    if (values.notes) meta.notes = values.notes
    if (values.waterAmount) meta.waterAmount = Number(values.waterAmount)
    if (values.product) meta.product = values.product
    if (values.dose) meta.dose = values.dose

    setEvents([
      ...events,
      {
        id: crypto.randomUUID(),
        title: values.title,
        type: values.type,
        parcelId: values.parcelId,
        parcelName: parcel?.name ?? "",
        color: TYPE_COLOR_MAP[values.type],
        start: new Date(values.start),
        end: new Date(values.end),
        meta,
      },
    ])
    handleClose()
  }

  function handleClose() {
    setNewEventDialogOpen(false)
    form.reset()
  }

  return (
    <Drawer
      open={newEventDialogOpen}
      onOpenChange={handleClose}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="min-w-fit">
        {/* ── Header ── */}
        <DrawerHeader className="gap-1">
          <DrawerTitle className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-income)] text-sm">
              📅
            </span>
            Nuevo evento agrícola
          </DrawerTitle>
        </DrawerHeader>

        {/* ── Scrollable form body ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 overflow-y-auto px-4 text-sm"
          >
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={sectionLabel}>
                    Título del evento
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Riego parcela norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={sectionLabel}>Tipo de tarea</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-5 gap-2">
                      {EVENT_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => field.onChange(t.value)}
                          className={`${baseBtn} flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 ${
                            field.value === t.value ? t.activeClass : ""
                          }`}
                        >
                          <span className="text-xl leading-none">{t.icon}</span>
                          <span className="text-center text-[0.6rem] leading-tight font-semibold">
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-px shrink-0 bg-border" />

            {/* Parcela */}
            <FormField
              control={form.control}
              name="parcelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={sectionLabel}>Parcela</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {PARCELS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => field.onChange(p.id)}
                          className={`${baseBtn} flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                            field.value === p.id
                              ? "border-[var(--primary-income)] bg-[color-mix(in_oklch,var(--primary-income)_10%,transparent)]"
                              : ""
                          }`}
                        >
                          <span className="shrink-0 text-base">🗺</span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={sectionLabel}>Inicio</FormLabel>
                    <FormControl>
                      <DateTimePicker field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={sectionLabel}>Fin</FormLabel>
                    <FormControl>
                      <DateTimePicker field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="h-px shrink-0 bg-border" />

            {/* Prioridad */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={sectionLabel}>Prioridad</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => field.onChange(p.value)}
                          className={`${baseBtn} rounded-lg py-2 text-xs font-semibold ${
                            field.value === p.value ? p.activeClass : ""
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dinámico: Tratamiento / Fertilización */}
            {(selectedType === "treatment" ||
              selectedType === "fertilization") && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={sectionLabel}>Producto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === "fertilization"
                              ? "NPK 15-15-15"
                              : "Bacillus thur..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={sectionLabel}>Dosis</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === "fertilization"
                              ? "300 kg/ha"
                              : "1.5 kg/ha"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Dinámico: Riego */}
            {selectedType === "irrigation" && (
              <FormField
                control={form.control}
                name="waterAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={sectionLabel}>
                      Cantidad de agua (L)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={sectionLabel}>
                    Notas{" "}
                    <span className="font-normal tracking-normal normal-case">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Observaciones adicionales..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* ── Footer ── */}
        <DrawerFooter>
          <Button onClick={form.handleSubmit(onSubmit)}>Crear evento</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
