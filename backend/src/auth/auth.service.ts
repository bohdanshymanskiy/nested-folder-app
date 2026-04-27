import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, string>();

  constructor(private readonly usersService: UsersService) {}

  register(email: string, password: string) {
    if (this.usersService.findByEmail(email)) {
      throw new ConflictException("Email already in use");
    }

    const user = this.usersService.create(email, password);
    const token = this.createSession(user.id);
    return { token, user: { id: user.id, email: user.email } };
  }

  login(email: string, password: string) {
    const user = this.usersService.findByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.createSession(user.id);
    return { token, user: { id: user.id, email: user.email } };
  }

  getUserIdFromToken(token: string | undefined): string | null {
    if (!token) {
      return null;
    }

    return this.sessions.get(token) ?? null;
  }

  private createSession(userId: string): string {
    const token = Buffer.from(`${userId}:${Date.now()}`).toString("base64url");
    this.sessions.set(token, userId);
    return token;
  }
}
