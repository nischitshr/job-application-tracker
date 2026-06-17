import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

// What we send back — never include the password!
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── REGISTER ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email is already taken
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash the password — never store plain text passwords
    // 10 = salt rounds (how hard the hash is to crack, 10 is the standard)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return this.generateAuthResponse(user);
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Use a generic message — don't tell the user whether email or password was wrong
    // (security: prevents email enumeration attacks)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare the provided password against the stored hash
    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  // ── HELPER ───────────────────────────────────────────────────────────────────
  private generateAuthResponse(user: User): AuthResponse {
    // Sign the JWT — this is what the frontend stores and sends with every request
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
