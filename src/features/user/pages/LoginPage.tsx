import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { showToast } from '@/lib/toast';
import { UserAuthLayout } from '../components/UserAuthLayout';
import { LoginForm } from '../components/LoginForm';
import type { LoginPayload } from '@/types';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const isSubmitting = status === 'loading';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    const result = await dispatch(loginUser(values as LoginPayload));

    if (loginUser.fulfilled.match(result)) {
      showToast.success('Inicio de sesión exitoso');
      navigate('/');
    } else {
      showToast.error(result.payload as string);
    }
  };

  return (
    <UserAuthLayout
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para acceder"
    >
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </UserAuthLayout>
  );
}