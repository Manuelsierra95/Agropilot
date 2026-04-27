import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateOrganizationSchema } from "@workspace/schemas"
import type {
  UpdateOrganizationInput,
  AuthOrganization,
} from "@workspace/schemas"
import { useUpdateOrganization } from "@/features/settings/hooks/use-update-organization"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type Props = {
  org: AuthOrganization
}

export function OrganizationForm({ org }: Props) {
  const { mutate, isPending, isError, error } = useUpdateOrganization()

  const form = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: org.name,
      slug: org.slug,
    },
  })

  const onSubmit = (data: UpdateOrganizationInput) => {
    mutate(data)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid max-w-md gap-4 pt-4"
    >
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization name</Label>
        <Input id="org-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="org-slug">URL slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            app.example.com/
          </span>
          <Input id="org-slug" {...form.register("slug")} className="flex-1" />
        </div>
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
        {isError && (
          <p className="text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        )}
      </Button>
    </form>
  )
}
