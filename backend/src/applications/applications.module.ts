import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

// Feature modules encapsulate everything related to one domain (applications).
// PrismaService is NOT imported here because PrismaModule is @Global().
@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
