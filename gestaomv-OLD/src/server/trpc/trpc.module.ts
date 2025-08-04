import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { AuthModule } from '../auth/auth.module';
import { BaseModule } from '../base/base.module';
import { TagoneModule } from '../tagone/tagone.module';
import { AlmoxarifadoModule } from '../almoxarifado/almoxarifado.module';
import { RhModule } from '../rh/rh.module';
import { PontowebModule } from '../pontoweb/pontoweb.module';

@Module({
  imports: [
    AuthModule,
    BaseModule,
    TagoneModule,
    AlmoxarifadoModule,
    RhModule,
    PontowebModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}
