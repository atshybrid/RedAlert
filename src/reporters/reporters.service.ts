import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReporterDto } from "./dto/create-reporter.dto";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { IResponse } from "../types/index";
import { ResponseUtil } from "../common/utils/response.util";

type ReporterLevel =
  | "BUREAU_REPORTER"
  | "STAFF_REPORTER"
  | "CRIME_REPORTER"
  | "RC_INCHARGE"
  | "REPORTER";

@Injectable()
export class ReportersService {
  private readonly logger = new Logger(ReportersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateReporterHierarchy(dto: CreateReporterDto) {
    switch (dto.level) {
      case "BUREAU_REPORTER":
        if (
          dto.parentId ||
          dto.districtId ||
          dto.constituencyId ||
          dto.mandalId
        ) {
          throw new BadRequestException(
            "Bureau Reporter should only have country and state"
          );
        }
        break;

      case "STAFF_REPORTER":
      case "CRIME_REPORTER":
        if (!dto.districtId || !dto.constituencyId || !dto.mandalId) {
          throw new BadRequestException(
            "Staff/Crime Reporter should have country, state, district and mandalId"
          );
        }
        break;

      case "RC_INCHARGE":
        if (!dto.districtId || !dto.constituencyId || !dto.mandalId) {
          throw new BadRequestException(
            "RC Incharge should have country, state, district, and constituency"
          );
        }
        break;

      case "REPORTER":
        if (!dto.districtId || !dto.constituencyId || !dto.mandalId) {
          throw new BadRequestException(
            "Reporter should have country, state, district, constituency, and mandal"
          );
        }
        break;
    }
  }

  private validateParentChildRelationship(
    childLevel: ReporterLevel,
    parentLevel: ReporterLevel
  ) {
    switch (childLevel) {
      case "BUREAU_REPORTER":
        throw new BadRequestException("Bureau Reporter cannot have a parent");

      case "STAFF_REPORTER":
      case "CRIME_REPORTER":
        if (parentLevel !== "BUREAU_REPORTER") {
          throw new BadRequestException(
            "Staff/Crime Reporter must have Bureau Reporter as parent"
          );
        }
        break;

      case "RC_INCHARGE":
        if (parentLevel !== "STAFF_REPORTER") {
          throw new BadRequestException(
            "RC Incharge must have Staff Reporter as parent"
          );
        }
        break;

      case "REPORTER":
        if (parentLevel !== "RC_INCHARGE" && parentLevel !== "STAFF_REPORTER") {
          throw new BadRequestException(
            "Reporter must have RC Incharge or Staff Reporter as parent"
          );
        }
        break;
    }
  }

  private canCreateReporterOfLevel(
    creatorLevel: ReporterLevel,
    newReporterLevel: ReporterLevel
  ): boolean {
    switch (creatorLevel) {
      case "BUREAU_REPORTER":
        return ["STAFF_REPORTER", "CRIME_REPORTER"].includes(newReporterLevel);

      case "STAFF_REPORTER":
        return ["RC_INCHARGE", "REPORTER"].includes(newReporterLevel);

      case "RC_INCHARGE":
        return newReporterLevel === "REPORTER";

      default:
        return false;
    }
  }

  async create(
    creatorUserId: number,
    dto: CreateReporterDto
  ): Promise<IResponse> {
    try {
      const creator = await this.prisma.reporter.findFirst({
        where: { userId: creatorUserId },
        include: {
          user: true,
        },
      });
      if (
        !this.canCreateReporterOfLevel(
          creator.level as ReporterLevel,
          dto.level as ReporterLevel
        )
      ) {
        return ResponseUtil.error(
          `${creator.level} cannot create ${dto.level}`,
          403
        );
      }

      this.validateReporterHierarchy(dto);

      if (!dto.parentId) {
        dto.parentId = creator.id;
      }

      if (dto.parentId) {
        const parent = await this.prisma.reporter.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          return ResponseUtil.error("Parent reporter not found", 404);
        }
        console.log(parent, "parentparentparent");
        this.validateParentChildRelationship(
          dto.level as ReporterLevel,
          parent.level as ReporterLevel
        );
        dto.parentUserId = parent.userId;
      }

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          role: Role.reporter,
          status: UserStatus.inactive,
        },
      });

      const reporter = await this.prisma.reporter.create({
        data: {
          userId: user.id,
          level: dto.level,
          parentId: dto.parentUserId,
          countryId: dto.countryId,
          stateId: dto.stateId,
          districtId: dto.districtId,
          constituencyId: dto.constituencyId,
          mandalId: dto.mandalId,
          joiningFee: dto.joiningFee
            ? new Prisma.Decimal(dto.joiningFee)
            : null,
          monthlyFee: dto.monthlyFee
            ? new Prisma.Decimal(dto.monthlyFee)
            : null,
          autoLive: dto.autoLive ?? false,
          profilePhotoUrl: dto.profilePhotoUrl,
        },
        include: {
          user: true,
          country: true,
          state: true,
          district: true,
          constituency: true,
          mandal: true,
        },
      });

      return ResponseUtil.success(
        reporter,
        "Reporter created successfully",
        201
      );
    } catch (error) {
      this.logger.error("Failed to create reporter", error.stack);
      return ResponseUtil.error("Failed to create reporter", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const reporter = await this.prisma.reporter.findUnique({
        where: { id },
        include: {
          user: true,
          country: true,
          state: true,
          district: true,
          constituency: true,
          mandal: true,
        },
      });

      if (!reporter) {
        return ResponseUtil.error("Reporter not found", 404);
      }

      return ResponseUtil.success(reporter, "Reporter retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve reporter", error.stack);
      return ResponseUtil.error("Failed to retrieve reporter", 500);
    }
  }

  async getIdCardDetails(id: number) {
    // const reporter = await this.findOne(id);
    // // Update reporter with ID card URL
    // return this.prisma.reporter.update({
    //   where: { id },
    //   data: {
    //     idCardUrl,
    //   },
    // });
    return;
  }

  async findAll(): Promise<IResponse> {
    try {
      const reporters = await this.prisma.reporter.findMany({
        include: {
          user: true,
          country: true,
          state: true,
          district: true,
          constituency: true,
          mandal: true,
        },
      });

      return ResponseUtil.success(
        reporters,
        "Reporters retrieved successfully"
      );
    } catch (error) {
      this.logger.error("Failed to retrieve reporters", error.stack);
      return ResponseUtil.error("Failed to retrieve reporters", 500);
    }
  }
}
