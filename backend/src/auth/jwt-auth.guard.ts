import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard protects routes — attach it with @UseGuards(JwtAuthGuard)
// It automatically checks the Authorization header, verifies the JWT,
// and calls JwtStrategy.validate() to attach user to request
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
