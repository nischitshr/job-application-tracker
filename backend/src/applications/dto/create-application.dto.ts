import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { JobType, ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name must not be empty' })
  @MinLength(1)
  @MaxLength(200, { message: 'Company name must not exceed 200 characters' })
  company_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Job title must not be empty' })
  @MinLength(1)
  @MaxLength(200, { message: 'Job title must not exceed 200 characters' })
  job_title!: string;

  // IsEnum validates against the Prisma-generated enum — single source of truth
  @IsEnum(JobType, {
    message: `job_type must be one of: ${Object.values(JobType).join(', ')}`,
  })
  job_type!: JobType;

  @IsEnum(ApplicationStatus, {
    message: `status must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ApplicationStatus;

  // ISO 8601 date string e.g. "2024-03-15" or "2024-03-15T00:00:00.000Z"
  @IsDateString({}, { message: 'applied_date must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'applied_date is required' })
  applied_date!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Notes must not exceed 2000 characters' })
  notes?: string;
}
