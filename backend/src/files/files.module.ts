import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthGuard } from "../common/auth.guard";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PublicController } from "./public.controller";

@Module({
  imports: [AuthModule],
  controllers: [FilesController, PublicController],
  providers: [FilesService, AuthGuard],
})
export class FilesModule {}
