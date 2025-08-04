import { Injectable, Inject } from '@nestjs/common';
import type { Database } from './database';

@Injectable()
export class DatabaseService {
  constructor(@Inject('DATABASE') public readonly drizzle: Database) {}
}
