import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

// This DTO validates GET /applications query parameters.
// e.g. GET /api/applications?status=Interviewing&search=google
export class QueryApplicationDto {
  @IsEnum(ApplicationStatus, {
    message: `status must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ApplicationStatus;

  // Full-text search across company_name OR job_title
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  search?: string;
}
