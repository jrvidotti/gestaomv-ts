import { Module } from "@nestjs/common";
import { forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
// import { AuthController } from './auth.controller';
import { AuthService } from "../auth.service";
import { BaseModule } from "../base/base.module";
import { EmailModule } from "../email/email.module";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		BaseModule,
		EmailModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get("jwt.secret"),
				signOptions: { expiresIn: configService.get("jwt.expiresIn") },
			}),
			inject: [ConfigService],
		}),
	],
	// controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
