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
  UseGuards,
} from '@nestjs/common';
import { Application } from '@prisma/client';
import { ApplicationsService, PaginatedApplications } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ParseUUIDParam } from '../common/pipes/parse-uuid-param.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

// @UseGuards(JwtAuthGuard) on the class protects ALL routes in this controller
// The user must send: Authorization: Bearer <token> in every request
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateApplicationDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<Application> {
    return this.applicationsService.create(dto, user.id);
  }

  @Get()
  async findAll(
    @Query() query: QueryApplicationDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<PaginatedApplications> {
    return this.applicationsService.findAll(query, user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDParam) id: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<Application> {
    return this.applicationsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDParam) id: string,
    @Body() dto: UpdateApplicationDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<Application> {
    return this.applicationsService.update(id, dto, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDParam) id: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<Application> {
    return this.applicationsService.remove(id, user.id);
  }
}
