import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BaseModule } from './base/base.module';
import { TrpcModule } from './trpc/trpc.module';
import { TagoneModule } from './tagone/tagone.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { StorageModule } from './storage/storage.module';
import { PontowebModule } from './pontoweb/pontoweb.module';
import getConfig from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfig],
    }),
    DatabaseModule,
    AuthModule,
    BaseModule,
    TrpcModule,
    TagoneModule,
    EmailModule,
    StorageModule,
    PontowebModule,
  ],
  providers: [AppService],
})
export class AppModule {}
