import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Injeção do CACHE_MANAGER
  ) {}

  // Método para obter um item do cache
  async get<T>(key: string): Promise<T> {
    return this.cacheManager.get(key); // Utiliza o cacheManager injetado para obter dados do cache
  }

  // Método para definir um item no cache
  async set<T>(key: string, value: T): Promise<void> {
    await this.cacheManager.set(key, value); // Utiliza o cacheManager injetado para salvar dados no cache
  }
}
