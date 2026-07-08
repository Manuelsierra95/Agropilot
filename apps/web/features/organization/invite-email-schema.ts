import { z } from "zod"

export const inviteEmailSchema = z
  .string()
  .trim()
  .min(1, "Introduce un correo electrónico.")
  .email("Introduce un correo válido (por ejemplo, nombre@empresa.com).")
