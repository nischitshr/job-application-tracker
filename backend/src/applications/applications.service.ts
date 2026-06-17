import { Injectable, NotFoundException } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';

export interface PaginatedApplications {
  data: Application[];
  total: number;
  filters: {
    status?: string;
    search?: string;
  };
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateApplicationDto, userId: string): Promise<Application> {
    return this.prisma.application.create({
      data: {
        company_name: dto.company_name,
        job_title: dto.job_title,
        job_type: dto.job_type,
        ...(dto.status && { status: dto.status }),
        applied_date: new Date(dto.applied_date),
        notes: dto.notes ?? null,
        user_id: userId, // link to the logged-in user
      },
    });
  }

  // ── FIND ALL ────────────────────────────────────────────────────────────────
  async findAll(query: QueryApplicationDto, userId: string): Promise<PaginatedApplications> {
    const { status, search } = query;

    const where: Prisma.ApplicationWhereInput = {
      user_id: userId, // only return THIS user's applications

      ...(status && { status }),

      ...(search && {
        OR: [
          { company_name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { job_title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        orderBy: { applied_date: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data: applications, total, filters: { status, search } };
  }

  // ── FIND ONE ────────────────────────────────────────────────────────────────
  async findOne(id: string, userId: string): Promise<Application> {
    const application = await this.prisma.application.findFirst({
      where: {
        id,
        user_id: userId, // ensure user can only access their own
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }

    return application;
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateApplicationDto, userId: string): Promise<Application> {
    await this.findOne(id, userId);

    return this.prisma.application.update({
      where: { id },
      data: {
        ...(dto.company_name !== undefined && { company_name: dto.company_name }),
        ...(dto.job_title !== undefined && { job_title: dto.job_title }),
        ...(dto.job_type !== undefined && { job_type: dto.job_type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.applied_date !== undefined && { applied_date: new Date(dto.applied_date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  async remove(id: string, userId: string): Promise<Application> {
    await this.findOne(id, userId);

    return this.prisma.application.delete({
      where: { id },
    });
  }
}
