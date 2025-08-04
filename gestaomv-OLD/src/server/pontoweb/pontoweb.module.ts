import { Module } from '@nestjs/common';
import { PontowebService } from './pontoweb.service';
import { BaseModule } from '../base/base.module';
import { RhModule } from '../rh/rh.module';

@Module({
  imports: [BaseModule, RhModule],
  providers: [PontowebService],
  exports: [PontowebService],
})
export class PontowebModule {}
