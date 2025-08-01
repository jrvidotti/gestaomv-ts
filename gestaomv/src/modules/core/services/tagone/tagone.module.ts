import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { TagoneService } from "../tagone.service";

@Module({
	imports: [DatabaseModule],
	providers: [TagoneService],
	exports: [TagoneService],
})
export class TagoneModule {}
