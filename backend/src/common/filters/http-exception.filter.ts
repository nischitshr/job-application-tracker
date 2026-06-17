import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

// Shape of every error response the API returns
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

// Catch ALL exceptions — HttpException and anything unexpected (Prisma, etc.)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request.url);

    // Log 5xx errors as errors; 4xx as warnings
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `[${errorResponse.statusCode}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${errorResponse.statusCode}] ${request.method} ${request.url} — ${JSON.stringify(errorResponse.message)}`,
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, path: string): ErrorResponse {
    const timestamp = new Date().toISOString();

    // ── NestJS HTTP Exceptions (most common) ────────────────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // class-validator errors come back as an object with a message array
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const resp = exceptionResponse as { message: string | string[]; error?: string };
        return {
          statusCode: status,
          message: resp.message,
          error: resp.error ?? exception.name,
          path,
          timestamp,
        };
      }

      return {
        statusCode: status,
        message: exception.message,
        error: exception.name,
        path,
        timestamp,
      };
    }

    // ── Prisma Known Request Errors ─────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, path, timestamp);
    }

    // ── Prisma Validation Errors ────────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided to the database',
        error: 'Database Validation Error',
        path,
        timestamp,
      };
    }

    // ── Unknown / Unexpected Errors ─────────────────────────────────────────
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
      path,
      timestamp,
    };
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    path: string,
    timestamp: string,
  ): ErrorResponse {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with this value already exists',
          error: 'Conflict',
          path,
          timestamp,
        };
      case 'P2025': // Record not found (e.g., update/delete on non-existent)
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
          path,
          timestamp,
        };
      case 'P2003': // Foreign key constraint failure
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related record does not exist',
          error: 'Bad Request',
          path,
          timestamp,
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
          error: 'Database Error',
          path,
          timestamp,
        };
    }
  }
}
