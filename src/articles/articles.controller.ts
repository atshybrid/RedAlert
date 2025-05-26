import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("api/articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(req.user.id, createArticleDto);
  }

  @Get()
  async findAll(
    @Query("language") language?: string,
    @Query("state") state?: string
  ) {
    return this.articlesService.findAll({ language, state });
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard)
  @Roles(Role.desk, Role.admin)
  async updateStatus(
    @Param("id") id: string,
    @Request() req,
    @Body("isLive") isLive: boolean
  ) {
    return this.articlesService.updateStatus(+id, req.user.userId, isLive);
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param("id") id: string,
    @Request() req,
    @Body("content") content: string
  ) {
    return this.articlesService.addComment(+id, req.user.userId, content);
  }
}
