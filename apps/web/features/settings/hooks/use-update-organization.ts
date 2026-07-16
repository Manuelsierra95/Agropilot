import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@workspace/web/lib/api"
import type {
  UpdateOrganizationInput,
  AuthOrganization,
} from "@workspace/schemas"

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrganizationInput) =>
      api.organization.update(data) as Promise<AuthOrganization>,
    onSuccess: (updatedOrg: AuthOrganization) => {
      queryClient.setQueryData(["organization"], updatedOrg)
    },
  })
}
