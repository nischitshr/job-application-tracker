import { IsString, IsEnum, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';
import { JobType, ApplicationStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  company_name?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  job_title?: string;

  @IsEnum(JobType)
  @IsOptional()
  job_type?: JobType;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsDateString()
  @IsOptional()
  applied_date?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}