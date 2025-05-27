import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateArticleDto, LanguageCode } from "./dto/create-article.dto";
import { Role, Prisma } from "@prisma/client";
import slugify from "slugify";
import { IResponse } from "../types";
import { ResponseUtil } from "../common/utils/response.util";

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  // Language specific transliteration maps
  private readonly transliterationMap = {
    [LanguageCode.HI]: {
      अ: "a",
      आ: "aa",
      इ: "i",
      ई: "ee",
      उ: "u",
      ऊ: "oo",
      ए: "e",
      ऐ: "ai",
      ओ: "o",
      औ: "au",
      क: "k",
      ख: "kh",
      ग: "g",
      घ: "gh",
      ङ: "ng",
      च: "ch",
      छ: "chh",
      ज: "j",
      झ: "jh",
      ञ: "ny",
      ट: "t",
      ठ: "th",
      ड: "d",
      ढ: "dh",
      ण: "n",
      त: "t",
      थ: "th",
      द: "d",
      ध: "dh",
      न: "n",
      प: "p",
      फ: "ph",
      ब: "b",
      भ: "bh",
      म: "m",
      य: "y",
      र: "r",
      ल: "l",
      व: "v",
      श: "sh",
      ष: "sh",
      स: "s",
      ह: "h",
      "ा": "a",
      "ि": "i",
      "ी": "ee",
      "ु": "u",
      "ू": "oo",
      "े": "e",
      "ै": "ai",
      "ो": "o",
      "ौ": "au",
      "ं": "n",
      "ः": "h",
      "्": "",
      ज़: "z",
      फ़: "f",
    },
    [LanguageCode.GU]: {
      અ: "a",
      આ: "aa",
      ઇ: "i",
      ઈ: "ee",
      ઉ: "u",
      ઊ: "oo",
      એ: "e",
      ઐ: "ai",
      ઓ: "o",
      ઔ: "au",
      ક: "k",
      ખ: "kh",
      ગ: "g",
      ઘ: "gh",
      ઙ: "ng",
      ચ: "ch",
      છ: "chh",
      જ: "j",
      ઝ: "jh",
      ઞ: "ny",
      ટ: "t",
      ઠ: "th",
      ડ: "d",
      ઢ: "dh",
      ણ: "n",
      ત: "t",
      થ: "th",
      દ: "d",
      ધ: "dh",
      ન: "n",
      પ: "p",
      ફ: "ph",
      બ: "b",
      ભ: "bh",
      મ: "m",
      ય: "y",
      ર: "r",
      લ: "l",
      વ: "v",
      શ: "sh",
      ષ: "sh",
      સ: "s",
      હ: "h",
      "ા": "a",
      "િ": "i",
      "ી": "ee",
      "ુ": "u",
      "ૂ": "oo",
      "ે": "e",
      "ૈ": "ai",
      "ો": "o",
      "ૌ": "au",
      "ં": "n",
      "ઃ": "h",
      "્": "",
    },
    [LanguageCode.TE]: {
      అ: "a",
      ఆ: "aa",
      ఇ: "i",
      ఈ: "ee",
      ఉ: "u",
      ఊ: "oo",
      ఎ: "e",
      ఏ: "e",
      ఐ: "ai",
      ఒ: "o",
      ఓ: "o",
      ఔ: "au",
      క: "ka",
      ఖ: "kha",
      గ: "ga",
      ఘ: "gha",
      ఙ: "nga",
      చ: "cha",
      ছ: "chha",
      జ: "ja",
      ఝ: "jha",
      ఞ: "nya",
      ట: "ta",
      ఠ: "tha",
      డ: "da",
      ఢ: "dha",
      ణ: "na",
      త: "ta",
      థ: "tha",
      ద: "da",
      ధ: "dha",
      న: "na",
      ప: "pa",
      ఫ: "pha",
      బ: "ba",
      భ: "bha",
      మ: "ma",
      య: "ya",
      ర: "ra",
      ల: "la",
      వ: "va",
      శ: "sha",
      ష: "sha",
      స: "sa",
      హ: "ha",
      ళ: "la",
      "ా": "a",
      "ి": "i",
      "ీ": "ee",
      "ు": "u",
      "ూ": "oo",
      "ె": "e",
      "ే": "e",
      "ై": "ai",
      "ొ": "o",
      "ో": "o",
      "ౌ": "au",
      "ం": "m",
      "ః": "h",
      "్": "",
      "ఁ": "",
      "ృ": "ru",
    },
  };

  constructor(private prisma: PrismaService) {}

  private transliterate(text: string, languageCode: LanguageCode): string {
    // If it's English, return as is
    if (languageCode === LanguageCode.EN) {
      return text;
    }

    // Get the transliteration map for the language
    const map = this.transliterationMap[languageCode];
    if (!map) {
      // If no transliteration map exists, use slugify's default behavior
      this.logger.warn(
        `No transliteration map for language ${languageCode}, using text as is`
      );
      return text;
    }

    // Transliterate character by character
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      result += map[char] || char;
    }

    // Clean up any double spaces and trim
    result = result.replace(/\s+/g, " ").trim();

    this.logger.debug(`Transliterated "${text}" to "${result}"`);
    return result;
  }

  private async generateUniqueSlug(
    originalText: string,
    languageCode: LanguageCode
  ): Promise<string> {
    // First transliterate the text to English
    const transliteratedText = this.transliterate(originalText, languageCode);

    // Create a base slug without any numbers
    let baseSlug = slugify(transliteratedText, {
      lower: true, // Convert to lowercase
      strict: true, // Strip special characters except replacement
      trim: true, // Trim leading and trailing replacement chars
    });

    // Check if this slug already exists
    let slug = baseSlug;
    let counter = 0;

    while (true) {
      const existingArticle = await this.prisma.article.findFirst({
        where: { slug },
      });

      if (!existingArticle) {
        // If no article exists with this slug, we can use it
        break;
      }

      // If slug exists, append counter and try again
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
