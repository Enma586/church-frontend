import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { showToast } from '@/lib/toast';
import type { CreateProductPayload, UpdateProductPayload } from '@/types';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductPayload) => productService.create(data),
    onSuccess: () => {
      showToast.success('Producto creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productService.update(id, data),
    onSuccess: () => {
      showToast.success('Producto actualizado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      showToast.success('Producto eliminado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}