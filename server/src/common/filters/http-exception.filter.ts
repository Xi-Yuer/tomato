import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: any;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || exception.message;
      error = responseObj.error;
    } else {
      message = exception.message;
    }

    // 如果是数组形式的错误消息，取第一个
    if (Array.isArray(message)) {
      message = message[0];
    }

    const result: ApiResponse = {
      code: status,
      message: message || '请求失败',
      data: null,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(result);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '服务器内部错误';
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = Array.isArray(responseObj.message)
          ? responseObj.message[0]
          : responseObj.message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const result: ApiResponse = {
      code: status,
      message: typeof message === 'string' ? message : '服务器内部错误',
      data: null,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(result);
  }
}
