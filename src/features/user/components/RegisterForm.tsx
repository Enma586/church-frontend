import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/FormInput';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Button } from '@/components/ui/button';

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'El nombre completo es requerido'),
    email: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
    username: z.string().trim().min(1, 'El usuario es requerido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, isSubmitting, error }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="fullName" control={form.control} label="Nombre completo" />
        <FormInput name="email" control={form.control} label="Correo electrónico" type="email" />
        <FormInput name="username" control={form.control} label="Usuario" />

        {/* ─── Contraseña ─────────────────────────────────────────── */}
        <div className="relative">
          <FormInput
            name="password"
            control={form.control}
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-5.5 h-9 w-9"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* ─── Confirmar contraseña ───────────────────────────────── */}
        <div className="relative">
          <FormInput
            name="confirmPassword"
            control={form.control}
            label="Confirmar contraseña"
            type={showConfirm ? 'text' : 'password'}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-5.5 h-9 w-9"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <FormSubmitButton
          isSubmitting={isSubmitting}
          label="Crear cuenta"
          className="w-full"
        />

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </Form>
  );
}