import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth/auth.service";

export interface AuthRequest extends Request {
  userId?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    const userId = this.authService.getUserIdFromToken(token);

    if (!userId) {
      throw new UnauthorizedException("Authentication required");
    }

    request.userId = userId;
    return true;
  }
}
