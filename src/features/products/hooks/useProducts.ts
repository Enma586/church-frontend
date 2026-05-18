import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductQueryParams } from '@/types';

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
}