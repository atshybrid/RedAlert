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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";

@ApiTags("📰 Articles")
@Controller("api/articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Create article",
    description:
      "Create a new article. Requires authentication and reporter profile.",
  })
  @ApiBody({
    type: CreateArticleDto,
    description: "Article creation details",
    examples: {
      example1: {
        summary: "News Article",
        value: {
          title: "Breaking News: Important Update",
          content: "This is the detailed content of the news article...",
          languageCode: "en",
          metaDescription:
            "Important news update about recent developments in the region",
          metaTitle: "Breaking News Update",
          keywords: ["politics", "breaking", "local"],
          countryId: 1,
          stateId: 1,
          districtId: 1,
          constituencyId: 1,
          mandalId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Article created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: { type: "string", example: "Article created successfully" },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            title: {
              type: "string",
              example: "Breaking News: Important Update",
            },
            slug: { type: "string", example: "breaking-news-important-update" },
            languageCode: { type: "string", example: "en" },
            isLive: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  async create(
    @Request() req: any,
    @Body() createArticleDto: CreateArticleDto
  ) {
    return this.articlesService.create(req.user.userId, createArticleDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all articles",
    description:
      "Get all published articles with optional filters for language and state.",
  })
  @ApiQuery({
    name: "language",
    required: false,
    description: "Filter by language code (e.g., en, hi, te)",
    example: "en",
  })
  @ApiQuery({
    name: "state",
    required: false,
    description: "Filter by state name",
    example: "telangana",
  })
  @ApiResponse({
    status: 200,
    description: "Articles retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "Articles retrieved successfully" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              title: { type: "string", example: "Breaking News" },
              content: { type: "string", example: "Article content..." },
              languageCode: { type: "string", example: "en" },
              isLive: { type: "boolean", example: true },
              createdAt: { type: "string", example: "2024-01-01T00:00:00Z" },
            },
          },
        },
      },
    },
  })
  async findAll(
    @Query("language") language?: string,
    @Query("state") state?: string
  ) {
    return this.articlesService.findAll({ language, state });
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.desk, Role.admin, Role.reporter)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update article status",
    description:
      "Update the live status of an article. Only authorized users can publish/unpublish articles.",
  })
  @ApiParam({
    name: "id",
    description: "Article ID",
    example: 1,
    type: "number",
  })
  @ApiBody({
    description: "Article status update",
    schema: {
      type: "object",
      properties: {
        isLive: {
          type: "boolean",
          example: true,
          description: "Whether the article should be live/published",
        },
      },
      required: ["isLive"],
    },
    examples: {
      publish: {
        summary: "Publish Article",
        value: {
          isLive: true,
        },
      },
      unpublish: {
        summary: "Unpublish Article",
        value: {
          isLive: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Article status updated successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Article status updated successfully",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            isLive: { type: "boolean", example: true },
            updatedAt: { type: "string", example: "2024-01-01T00:00:00Z" },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  @ApiNotFoundResponse({
    description: "Article not found",
  })
  async updateStatus(
    @Param("id") id: string,
    @Request() req: any,
    @Body("isLive") isLive: boolean
  ) {
    return this.articlesService.updateStatus(+id, req.user.userId, isLive);
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Add comment to article",
    description: "Add a comment to an article. Requires authentication.",
  })
  @ApiParam({
    name: "id",
    description: "Article ID",
    example: 1,
    type: "number",
  })
  @ApiBody({
    description: "Comment content",
    schema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          example: "Great article! Very informative.",
          description: "Comment text content",
        },
      },
      required: ["content"],
    },
    examples: {
      example1: {
        summary: "Add Comment",
        value: {
          content: "Great article! Very informative.",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Comment added successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: { type: "string", example: "Comment added successfully" },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            content: {
              type: "string",
              example: "Great article! Very informative.",
            },
            createdAt: { type: "string", example: "2024-01-01T00:00:00Z" },
            user: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Doe" },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  @ApiNotFoundResponse({
    description: "Article not found",
  })
  async addComment(
    @Param("id") id: string,
    @Request() req: any,
    @Body("content") content: string
  ) {
    return this.articlesService.addComment(+id, req.user.userId, content);
  }
}
