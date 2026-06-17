import { Injectable, NotFoundException } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';

// ── Response Types ────────────────────────────────────────────────────────────
// Explicit return shapes keep the service contract clear and make
// the TypeScript compiler catch mistakes early.

export interface PaginatedApplications {
  data: Application[];
  total: number;
  filters: {
    status?: string;
    search?: string;
  };
}

// ── Service ───────────────────────────────────────────────────────────────────
@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateApplicationDto): Promise<Application> {
    return this.prisma.application.create({
      data: {
        company_name: dto.company_name,
        job_title: dto.job_title,
        job_type: dto.job_type,
        // If status is not provided, Prisma schema default ("Applied") applies
        ...(dto.status && { status: dto.status }),
        applied_date: new Date(dto.applied_date),
        notes: dto.notes ?? null,
      },
    });
  }

  // ── FIND ALL (with filter + search) ─────────────────────────────────────────
  async findAll(query: QueryApplicationDto): Promise<PaginatedApplications> {
    const { status, search } = query;

    // Build the where clause dynamically — only add conditions that exist
    const where: Prisma.ApplicationWhereInput = {
      // Filter by status (exact match)
      ...(status && { status }),

      // Search: case-insensitive match on company_name OR job_title
      // Prisma's `contains` + `mode: 'insensitive'` maps to ILIKE in PostgreSQL
      ...(search && {
        OR: [
          {
            company_name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            job_title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    // Use a transaction to fetch data + count in a single round-trip
    const [applications, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        orderBy: { applied_date: 'desc' }, // newest first
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      total,
      filters: { status, search },
    };
  }

  // ── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }

    return application;
  }

  // ── UPDATE (partial) ─────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateApplicationDto): Promise<Application> {
    // Verify it exists first — gives a clean 404 instead of Prisma's P2025
    await this.findOne(id);

    return this.prisma.application.update({
      where: { id },
      data: {
        ...(dto.company_name !== undefined && { company_name: dto.company_name }),
        ...(dto.job_title !== undefined && { job_title: dto.job_title }),
        ...(dto.job_type !== undefined && { job_type: dto.job_type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.applied_date !== undefined && {
          applied_date: new Date(dto.applied_date),
        }),
        // Explicitly allow setting notes to null (clearing it)
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<Application> {
    // Verify it exists first — gives a clean 404 instead of Prisma's P2025
    await this.findOne(id);

    return this.prisma.application.delete({
      where: { id },
    });
  }
}
