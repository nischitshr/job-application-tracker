import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Application } from '@prisma/client';
import { ApplicationsService, PaginatedApplications } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ParseUUIDParam } from '../common/pipes/parse-uuid-param.pipe';

// All routes are prefixed with /api (set in main.ts) + /applications here
// Final: /api/applications
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ── POST /api/applications ──────────────────────────────────────────────────
  // 201 Created is the correct HTTP status for successful resource creation
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createApplicationDto: CreateApplicationDto): Promise<Application> {
    return this.applicationsService.create(createApplicationDto);
  }

  // ── GET /api/applications ───────────────────────────────────────────────────
  // Optional query params: ?status=Applied&search=google
  @Get()
  async findAll(@Query() query: QueryApplicationDto): Promise<PaginatedApplications> {
    return this.applicationsService.findAll(query);
  }

  // ── GET /api/applications/:id ───────────────────────────────────────────────
  // ParseUUIDParam validates the :id before it reaches the service
  @Get(':id')
  async findOne(@Param('id', ParseUUIDParam) id: string): Promise<Application> {
    return this.applicationsService.findOne(id);
  }

  // ── PATCH /api/applications/:id ─────────────────────────────────────────────
  // PATCH = partial update (only the sent fields change)
  // PUT would require sending the entire resource
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDParam) id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  // ── DELETE /api/applications/:id ────────────────────────────────────────────
  // Returns the deleted resource so the client can update its local state
  @Delete(':id')
  async remove(@Param('id', ParseUUIDParam) id: string): Promise<Application> {
    return this.applicationsService.remove(id);
  }
}
