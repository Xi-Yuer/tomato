import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    return next.handle().pipe(
      map((data) => {
        return {
          code: 200,
          message: 'success',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
