import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

function extractJwtFromCookieOrHeader(req: Request): string | null {
  // Try cookie first
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  // Fallback to Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get('JWT_SECRET');
    if (!secret || secret === 'CHANGE_ME_GENERATE_WITH_openssl_rand_hex_32') {
      throw new Error(
        'JWT_SECRET is not configured. Generate one with: openssl rand -hex 32',
      );
    }
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
