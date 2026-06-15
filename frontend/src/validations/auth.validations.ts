import { z } from 'zod';

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El usuario es requerido'),  // ← quitamos .email()
  contrasena: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
