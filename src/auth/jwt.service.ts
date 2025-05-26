import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateToken(payload: {
    userId: number;
    phone: string;
  }): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
