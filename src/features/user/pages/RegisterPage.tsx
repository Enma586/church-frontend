import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/user.service';
import { showToast } from '@/lib/toast';
import { UserAuthLayout } from '../components/UserAuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { confirmPassword: _, ...payload } = values;
      const response = await userService.register(payload);

      if (response.success) {
        showToast.success('Cuenta creada exitosamente');
        navigate('/login');
      } else {
        setError(response.message || 'Error al registrarse');
        showToast.error(response.message || 'Error al registrarse');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
      showToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserAuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para acceder al sistema"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </UserAuthLayout>
  );
}