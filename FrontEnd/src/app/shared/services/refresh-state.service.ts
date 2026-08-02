import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

/**
 * Estado centralizado del single-flight refresh token.
 * Evita variables de módulo globales (problemáticas en SSR y memory leaks).
 */
@Injectable({ providedIn: 'root' })
export class RefreshStateService {
  private refreshing = false;
  private readonly queue: QueueItem[] = [];

  get isRefreshing(): boolean {
    return this.refreshing;
  }

  startRefresh(): void {
    this.refreshing = true;
  }

  finishRefresh(): void {
    this.refreshing = false;
  }

  enqueue(): Observable<string> {
    return new Observable<string>(observer => {
      const item: QueueItem = {
        resolve: token => {
          observer.next(token);
          observer.complete();
        },
        reject: error => {
          observer.error(error);
        },
      };
      this.queue.push(item);
    });
  }

  processQueue(token: string | null, error: unknown | null): void {
    for (const item of this.queue) {
      if (token) {
        item.resolve(token);
      } else {
        item.reject(error);
      }
    }
    this.queue.length = 0;
  }
}
