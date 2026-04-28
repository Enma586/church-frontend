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

const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isSubmitting, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="username" control={form.control} label="Usuario" />

        {/* ─── Campo contraseña con ojito ──────────────────────────── */}
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

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <FormSubmitButton
          isSubmitting={isSubmitting}
          label="Iniciar sesión"
          className="w-full"
        />

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Registrarse
          </Link>
        </p>
      </form>
    </Form>
  );
}