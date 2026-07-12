import { BadRequestException, Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

const IMAGE_MIME_REGEX = /^image\/(jpe?g|png|webp|gif)$/;

const storage = diskStorage({
  destination: "./uploads",
  filename: (_req, file, callback) => {
    const unique = randomUUID();
    callback(null, `${unique}${extname(file.originalname)}`);
  },
});

function imageFileFilter(_req: unknown, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) {
  if (!IMAGE_MIME_REGEX.test(file.mimetype)) {
    callback(new BadRequestException("Chỉ chấp nhận file ảnh (jpg, png, webp, gif)."), false);
    return;
  }
  callback(null, true);
}

/**
 * Upload ảnh xe / avatar. Yêu cầu đăng nhập (bất kỳ role nào) để tránh spam.
 * Trả về URL tương đối — ghép với domain BE để hiển thị:
 * http://localhost:3001/uploads/<filename>
 */
@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post("image")
  @UseInterceptors(FileInterceptor("file", { storage, fileFilter: imageFileFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Không có file nào được tải lên.");
    return { url: `/uploads/${file.filename}` };
  }

  @Post("images")
  @UseInterceptors(FilesInterceptor("files", 20, { storage, fileFilter: imageFileFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException("Không có file nào được tải lên.");
    return { urls: files.map((f) => `/uploads/${f.filename}`) };
  }
}
