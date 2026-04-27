import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  UpdateOrganizationInput,
  AuthOrganization,
} from "@workspace/schemas"

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrganizationInput) =>
      api.organization.update(data),
    onSuccess: (updatedOrg: AuthOrganization) => {
      queryClient.setQueryData(["organization"], updatedOrg)
    },
  })
}
