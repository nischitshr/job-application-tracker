import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from './jwt.strategy';
import { Request } from 'express';

// Custom decorator to get the logged-in user cleanly in controllers
// Usage: @GetUser() user: AuthenticatedUser
// Instead of: @Req() req: Request and then req.user
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
