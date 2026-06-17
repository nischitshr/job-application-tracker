import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means any module that imports PrismaModule will NOT need to
// re-import it. Since the DB connection is used everywhere, this saves
// boilerplate. Use sparingly — only for truly cross-cutting infrastructure.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
