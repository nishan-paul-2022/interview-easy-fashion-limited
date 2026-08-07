import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor as NestFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Observable } from 'rxjs';

const multerOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new BadRequestException('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
};

@Injectable()
export class FilesInterceptor implements NestInterceptor {
  private interceptor: NestInterceptor;

  constructor() {
    const InterceptorClass = NestFilesInterceptor('files', 5, multerOptions);
    this.interceptor = new InterceptorClass();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return this.interceptor.intercept(context, next);
  }
}
