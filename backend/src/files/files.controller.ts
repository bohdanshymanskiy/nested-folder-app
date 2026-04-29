import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { AuthGuard, AuthRequest } from "../common/auth.guard";
import { FilesService } from "./files.service";

@ApiTags("files")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: "List files and folders" })
  list(@Req() req: AuthRequest, @Query("parentId") parentId?: string, @Query("q") query?: string) {
    return this.filesService.listForUser(req.userId!, parentId ?? null, query ?? "");
  }

  @Post("folder")
  createFolder(@Req() req: AuthRequest, @Body() body: { parentId?: string; name: string }) {
    return this.filesService.createFolder(req.userId!, body.parentId ?? null, body.name);
  }

  @Post("file")
  createFile(
    @Req() req: AuthRequest,
    @Body() body: { parentId?: string; name: string; content?: string },
  ) {
    return this.filesService.createFile(
      req.userId!,
      body.parentId ?? null,
      body.name,
      body.content ?? "",
    );
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFile(
    @Req() req: AuthRequest,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: { parentId?: string },
  ) {
    return this.filesService.uploadFile(
      req.userId!,
      body.parentId ?? null,
      file.originalname,
      file.buffer,
      file.mimetype,
    );
  }

  @Get(":id/download")
  download(@Req() req: AuthRequest, @Param("id") id: string, @Res() res: Response) {
    const { buffer, mimeType, name } = this.filesService.getFileBuffer(req.userId!, id);
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${name}"`,
    });
    res.send(buffer);
  }

  @Patch(":id/rename")
  rename(@Req() req: AuthRequest, @Param("id") id: string, @Body() body: { name: string }) {
    return this.filesService.rename(req.userId!, id, body.name);
  }

  @Patch(":id/visibility")
  visibility(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: { isPublic: boolean },
  ) {
    return this.filesService.toggleVisibility(req.userId!, id, body.isPublic);
  }

  @Post("reorder")
  reorder(@Req() req: AuthRequest, @Body() body: { parentId?: string; order: string[] }) {
    return this.filesService.reorder(req.userId!, body.parentId ?? null, body.order);
  }

  @Post(":id/clone")
  clone(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.filesService.clone(req.userId!, id);
  }

  @Delete(":id")
  remove(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.filesService.remove(req.userId!, id);
  }

  @Post(":id/share")
  share(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: { email: string; permission: "viewer" | "editor" },
  ) {
    return this.filesService.shareByEmail(req.userId!, id, body.email, body.permission);
  }
}
