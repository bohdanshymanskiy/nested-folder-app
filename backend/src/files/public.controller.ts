import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { FilesService } from "./files.service";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(private readonly filesService: FilesService) {}

  @Get(":token")
  @ApiOperation({ summary: "Read a publicly shared item by token" })
  readByToken(@Param("token") token: string) {
    return this.filesService.getByPublicToken(token);
  }
}
