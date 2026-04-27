import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

class AuthDto {
  email!: string;
  password!: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register user" })
  @ApiBody({ type: AuthDto })
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiBody({ type: AuthDto })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
