import { Injectable } from '@angular/core';
import { DEFAULT_PAGE_SIZE } from '../constants/domain.constants';
import { PaginatedResponse } from '../models/domain.models';

/**
 * Helper para trabajar con respuestas paginadas del backend Django REST Framework.
 */
@Injectable({ providedIn: 'root' })
export class PaginationService {
  readonly defaultPageSize = DEFAULT_PAGE_SIZE;

  /**
   * Extrae el número de página desde una URL de paginación del backend.
   * Ejemplo: 'http://127.0.0.1:8000/api/protocols/?page=3' -> 3
   */
  pageFromUrl(url: string | null): number | null {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const page = parsed.searchParams.get('page');
      return page ? Number(page) : 1;
    } catch {
      return null;
    }
  }

  /**
   * Indica si hay página siguiente/previa.
   */
  hasNext(response: PaginatedResponse<unknown>): boolean {
    return Boolean(response.next);
  }

  hasPrevious(response: PaginatedResponse<unknown>): boolean {
    return Boolean(response.previous);
  }

  /**
   * Calcula la cantidad total de páginas.
   */
  totalPages(response: PaginatedResponse<unknown>): number {
    return Math.ceil(response.count / this.defaultPageSize);
  }
}
