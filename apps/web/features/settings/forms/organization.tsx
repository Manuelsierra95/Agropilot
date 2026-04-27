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
