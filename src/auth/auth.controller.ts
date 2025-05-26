import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { SetMpinDto } from "./dto/set-mpin.dto";
import { CheckMpinDto } from "./dto/check-mpin.dto";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("request-otp")
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post("set-mpin")
  @HttpCode(HttpStatus.OK)
  async setMpin(@Body() dto: SetMpinDto) {
    return this.authService.setMpin(dto);
  }

  @Post("check-mpin")
  @HttpCode(HttpStatus.OK)
  async checkMpin(@Body() dto: CheckMpinDto) {
    return this.authService.checkMpin(dto);
  }
}
