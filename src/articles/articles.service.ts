import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { transliterate } from "transliteration";
import { CreateArticleDto, LanguageCode } from "./dto/create-article.dto";
import { Role, Prisma } from "@prisma/client";
import slugify from "slugify";
import { IResponse } from "../types/index";
import { ResponseUtil } from "../common/utils/response.util";

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  constructor(private prisma: PrismaService) {}

  private async translateToEnglish(
    text: string,
    languageCode: LanguageCode
  ): Promise<string> {
    if (languageCode === LanguageCode.EN) return text;

    // Replace this with real API integration
    // E.g., Google Translate API call here
    const translated = transliterate(text); // <-- implement this
    this.logger.debug(`Translated "${text}" to "${translated}"`);
    return translated;
  }

  private async generateUniqueSlug(
    originalText: string,
    languageCode: LanguageCode
  ): Promise<string> {
    // Translate the text to English
    const translatedText = await this.translateToEnglish(
      originalText,
      languageCode
    );

    // Create a slug from translated English text
    let baseSlug = slugify(translatedText, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 0;

    while (true) {
      const existingArticle = await this.prisma.article.findFirst({
        where: { slug },
      });

      if (!existingArticle) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  async create(
    userId: number,
    createArticleDto: CreateArticleDto
  ): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          reporter: true,
        },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      // Debug log the incoming data
      this.logger.debug(
        `Creating article with language: ${createArticleDto.languageCode}, title: ${createArticleDto.title}`
      );

      // Generate slug using the new method
      const slug = await this.generateUniqueSlug(
        createArticleDto.title,
        createArticleDto.languageCode
      );

      // Debug log the generated slug
      this.logger.debug(`Generated slug: ${slug}`);

      const locationData: any = {};
      if (createArticleDto.latitude && createArticleDto.longitude) {
        locationData.latitude = createArticleDto.latitude;
        locationData.longitude = createArticleDto.longitude;
      }
      locationData.stateId = createArticleDto.stateId;
      locationData.districtId = createArticleDto.districtId;
      locationData.constituencyId = createArticleDto.constituencyId;
      locationData.mandalId = createArticleDto.mandalId;
      locationData.villageName = createArticleDto.villageName;

      const article = await this.prisma.article.create({
        data: {
          title: createArticleDto.title,
          content: createArticleDto.content,
          imageUrl: createArticleDto.imageUrl,
          languageCode: createArticleDto.languageCode,
          metaTitle: createArticleDto.metaTitle,
          metaDescription: createArticleDto.metaDescription,
          keywords: createArticleDto.keywords,
          slug,
          reporterId: user.reporter?.id,
          isLive: user.reporter?.autoLive || false,
          isBreaking: createArticleDto?.isBreaking,
          ...locationData,
        },
        include: {
          reporter: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          state: true,
          district: true,
          constituency: true,
          mandal: true,
        },
      });

      return ResponseUtil.success(article, "Article created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create article", error.stack);
      return ResponseUtil.error("Failed to create article", 500);
    }
  }

  async findAll(params: {
    language?: string;
    state?: string;
  }): Promise<IResponse> {
    try {
      const { language, state } = params;

      const whereClause: Prisma.articleWhereInput = {
        isLive: true,
        ...(language ? { languageCode: language } : {}),
        ...(state ? { state: { name: state } } : {}),
      };

      const articles = await this.prisma.article.findMany({
        where: whereClause,
        include: {
          reporter: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          state: true,
          district: true,
          constituency: true,
          mandal: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return ResponseUtil.success(articles, "Articles retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve articles", error.stack);
      return ResponseUtil.error("Failed to retrieve articles", 500);
    }
  }

  async updateStatus(
    id: number,
    userId: number,
    isLive: boolean
  ): Promise<IResponse> {
    try {
      // First check if the article exists
      const existingArticle = await this.prisma.article.findUnique({
        where: { id },
      });
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingArticle) {
        return ResponseUtil.error("Article not found", 404);
      }

      const user = await this.prisma.reporter.findFirst({
        where: { id: existingArticle.reporterId },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      if (
        userId !== user?.parentId &&
        currentUser.role !== Role.desk &&
        currentUser.role !== Role.admin
      ) {
        return ResponseUtil.error(
          "Only desk, admin users and parent user can update article status",
          404
        );
      }

      const article = await this.prisma.article.update({
        where: { id },
        data: { isLive },
        include: {
          reporter: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return ResponseUtil.success(
        article,
        `Article ${isLive ? "published" : "unpublished"} successfully`
      );
    } catch (error) {
      this.logger.error(
        `Failed to update article status for article ${id}`,
        error.stack
      );
      return ResponseUtil.error("Failed to update article status", 500);
    }
  }

  async addComment(
    id: number,
    userId: number,
    content: string
  ): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      const comment = await this.prisma.comment.create({
        data: {
          content,
          articleId: id,
          userId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return ResponseUtil.success(comment, "Comment added successfully", 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            return ResponseUtil.error("Article not found", 404);
          case "P2003":
            return ResponseUtil.error("Invalid article reference", 400);
          default:
            return ResponseUtil.error("Failed to add comment", 400);
        }
      }
      this.logger.error("Failed to add comment", error.stack);
      return ResponseUtil.error("Failed to add comment", 500);
    }
  }
}
