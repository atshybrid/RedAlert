import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateConstituencyDto } from "../dto/create-constituency.dto";
import { UpdateConstituencyDto } from "../dto/update-constituency.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";

@Injectable()
export class ConstituenciesService {
  private readonly logger = new Logger(ConstituenciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createConstituencyDto: CreateConstituencyDto): Promise<IResponse> {
    try {
      // Check if district exists
      const district = await this.prisma.district.findUnique({
        where: { id: createConstituencyDto.districtId },
      });

      if (!district) {
        return ResponseUtil.error("District not found", 404);
      }

      // Check if constituency with same name already exists in this district
      const existingConstituency = await this.prisma.constituency.findFirst({
        where: {
          name: createConstituencyDto.name,
          districtId: createConstituencyDto.districtId,
        },
      });

      if (existingConstituency) {
        return ResponseUtil.error(
          "Constituency with this name already exists in this district",
          409
        );
      }

      const constituency = await this.prisma.constituency.create({
        data: createConstituencyDto,
        include: {
          district: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
          _count: {
            select: {
              mandals: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(constituency, "Constituency created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create constituency", error.stack);
      return ResponseUtil.error("Failed to create constituency", 500);
    }
  }

  async findAll(districtId?: number): Promise<IResponse> {
    try {
      const whereClause = districtId ? { districtId } : {};

      const constituencies = await this.prisma.constituency.findMany({
        where: whereClause,
        include: {
          district: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
          _count: {
            select: {
              mandals: true,
              reporters: true,
              articles: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return ResponseUtil.success(constituencies, "Constituencies retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve constituencies", error.stack);
      return ResponseUtil.error("Failed to retrieve constituencies", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const constituency = await this.prisma.constituency.findUnique({
        where: { id },
        include: {
          district: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
          mandals: {
            include: {
              _count: {
                select: {
                  reporters: true,
                  articles: true,
                },
              },
            },
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              mandals: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!constituency) {
        return ResponseUtil.error("Constituency not found", 404);
      }

      return ResponseUtil.success(constituency, "Constituency retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve constituency", error.stack);
      return ResponseUtil.error("Failed to retrieve constituency", 500);
    }
  }

  async update(id: number, updateConstituencyDto: UpdateConstituencyDto): Promise<IResponse> {
    try {
      // Check if constituency exists
      const existingConstituency = await this.prisma.constituency.findUnique({
        where: { id },
      });

      if (!existingConstituency) {
        return ResponseUtil.error("Constituency not found", 404);
      }

      // Check if district exists (if districtId is being updated)
      if (updateConstituencyDto.districtId) {
        const district = await this.prisma.district.findUnique({
          where: { id: updateConstituencyDto.districtId },
        });

        if (!district) {
          return ResponseUtil.error("District not found", 404);
        }
      }

      // Check if another constituency with same name exists in the same district
      if (updateConstituencyDto.name || updateConstituencyDto.districtId) {
        const districtId = updateConstituencyDto.districtId || existingConstituency.districtId;
        const name = updateConstituencyDto.name || existingConstituency.name;

        const duplicateConstituency = await this.prisma.constituency.findFirst({
          where: {
            name,
            districtId,
            id: { not: id },
          },
        });

        if (duplicateConstituency) {
          return ResponseUtil.error(
            "Constituency with this name already exists in this district",
            409
          );
        }
      }

      const constituency = await this.prisma.constituency.update({
        where: { id },
        data: updateConstituencyDto,
        include: {
          district: {
            include: {
              state: {
                include: {
                  country: true,
                },
              },
            },
          },
          _count: {
            select: {
              mandals: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(constituency, "Constituency updated successfully");
    } catch (error) {
      this.logger.error("Failed to update constituency", error.stack);
      return ResponseUtil.error("Failed to update constituency", 500);
    }
  }

  async remove(id: number): Promise<IResponse> {
    try {
      // Check if constituency exists
      const existingConstituency = await this.prisma.constituency.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              mandals: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!existingConstituency) {
        return ResponseUtil.error("Constituency not found", 404);
      }

      // Check if constituency has dependent records
      if (existingConstituency._count.mandals > 0) {
        return ResponseUtil.error(
          "Cannot delete constituency with existing mandals",
          400
        );
      }

      if (existingConstituency._count.reporters > 0) {
        return ResponseUtil.error(
          "Cannot delete constituency with existing reporters",
          400
        );
      }

      if (existingConstituency._count.articles > 0) {
        return ResponseUtil.error(
          "Cannot delete constituency with existing articles",
          400
        );
      }

      await this.prisma.constituency.delete({
        where: { id },
      });

      return ResponseUtil.success(null, "Constituency deleted successfully");
    } catch (error) {
      this.logger.error("Failed to delete constituency", error.stack);
      return ResponseUtil.error("Failed to delete constituency", 500);
    }
  }
}
