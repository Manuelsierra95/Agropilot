import { client } from "@/lib/api/client"

export const authApi = {
  signInWithGoogle: (options: { callbackURL: string }) =>
    client.api.v1.auth["get-session"].google!.$post({
      json: options,
    }),
}
