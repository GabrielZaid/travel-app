import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { AxiosError } from 'axios';
import type { Request, Response } from 'express';

@Catch()
export class HttpExternalFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExternalFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const axiosErr = exception as AxiosError | undefined;
    if (axiosErr && axiosErr.isAxiosError) {
      const status = axiosErr.response?.status ?? HttpStatus.BAD_GATEWAY;

      const message: string | Record<string, unknown> = (() => {
        const respData = axiosErr.response?.data;
        if (!respData) return axiosErr.message ?? 'External service error';
        if (typeof respData === 'string') return respData;
        if (typeof respData === 'object' && respData !== null) {
          const d = respData as Record<string, unknown>;
          if (typeof d.message === 'string') return d.message;
          if (d.errors !== undefined) {
            return { errors: d.errors } as Record<string, unknown>;
          }
        }
        return axiosErr.message ?? 'External service error';
      })();

      this.logger.warn({ message, status, url: request?.url });
      httpAdapter.reply(response, { statusCode: status, message }, status);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      httpAdapter.reply(response, payload, status);
      return;
    }

    this.logger.error(
      'Unhandled exception caught by HttpExternalFilter',
      String(exception),
    );
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    httpAdapter.reply(
      response,
      { statusCode: status, message: 'Internal server error' },
      status,
    );
  }
}
