import { Module } from '@nestjs/common';
import { TagoneService } from './tagone.service';
import { TagoneRouter } from './tagone.router';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TagoneService, TagoneRouter],
  exports: [TagoneService, TagoneRouter],
})
export class TagoneModule {}
