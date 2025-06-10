import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDistrictDto } from "../dto/create-district.dto";
import { UpdateDistrictDto } from "../dto/update-district.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";

@Injectable()
export class DistrictsService {
  private readonly logger = new Logger(DistrictsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDistrictDto: CreateDistrictDto): Promise<IResponse> {
    try {
      // Check if state exists
      const state = await this.prisma.state.findUnique({
        where: { id: createDistrictDto.stateId },
      });

      if (!state) {
        return ResponseUtil.error("State not found", 404);
      }

      // Check if district with same name already exists in this state
      const existingDistrict = await this.prisma.district.findFirst({
        where: {
          name: createDistrictDto.name,
          stateId: createDistrictDto.stateId,
        },
      });

      if (existingDistrict) {
        return ResponseUtil.error(
          "District with this name already exists in this state",
          409
        );
      }

      const district = await this.prisma.district.create({
        data: createDistrictDto,
        include: {
          state: {
            include: {
              country: true,
            },
          },
          _count: {
            select: {
              constituencies: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(district, "District created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create district", error.stack);
      return ResponseUtil.error("Failed to create district", 500);
    }
  }

  async findAll(stateId?: number): Promise<IResponse> {
    try {
      const whereClause = stateId ? { stateId } : {};

      const districts = await this.prisma.district.findMany({
        where: whereClause,
        include: {
          state: {
            include: {
              country: true,
            },
          },
          _count: {
            select: {
              constituencies: true,
              reporters: true,
              articles: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return ResponseUtil.success(districts, "Districts retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve districts", error.stack);
      return ResponseUtil.error("Failed to retrieve districts", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const district = await this.prisma.district.findUnique({
        where: { id },
        include: {
          state: {
            include: {
              country: true,
            },
          },
          constituencies: {
            include: {
              _count: {
                select: {
                  mandals: true,
                  reporters: true,
                },
              },
            },
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              constituencies: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!district) {
        return ResponseUtil.error("District not found", 404);
      }

      return ResponseUtil.success(district, "District retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve district", error.stack);
      return ResponseUtil.error("Failed to retrieve district", 500);
    }
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto): Promise<IResponse> {
    try {
      // Check if district exists
      const existingDistrict = await this.prisma.district.findUnique({
        where: { id },
      });

      if (!existingDistrict) {
        return ResponseUtil.error("District not found", 404);
      }

      // Check if state exists (if stateId is being updated)
      if (updateDistrictDto.stateId) {
        const state = await this.prisma.state.findUnique({
          where: { id: updateDistrictDto.stateId },
        });

        if (!state) {
          return ResponseUtil.error("State not found", 404);
        }
      }

      // Check if another district with same name exists in the same state
      if (updateDistrictDto.name || updateDistrictDto.stateId) {
        const stateId = updateDistrictDto.stateId || existingDistrict.stateId;
        const name = updateDistrictDto.name || existingDistrict.name;

        const duplicateDistrict = await this.prisma.district.findFirst({
          where: {
            name,
            stateId,
            id: { not: id },
          },
        });

        if (duplicateDistrict) {
          return ResponseUtil.error(
            "District with this name already exists in this state",
            409
          );
        }
      }

      const district = await this.prisma.district.update({
        where: { id },
        data: updateDistrictDto,
        include: {
          state: {
            include: {
              country: true,
            },
          },
          _count: {
            select: {
              constituencies: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(district, "District updated successfully");
    } catch (error) {
      this.logger.error("Failed to update district", error.stack);
      return ResponseUtil.error("Failed to update district", 500);
    }
  }

  async remove(id: number): Promise<IResponse> {
    try {
      // Check if district exists
      const existingDistrict = await this.prisma.district.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              constituencies: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!existingDistrict) {
        return ResponseUtil.error("District not found", 404);
      }

      // Check if district has dependent records
      if (existingDistrict._count.constituencies > 0) {
        return ResponseUtil.error(
          "Cannot delete district with existing constituencies",
          400
        );
      }

      if (existingDistrict._count.reporters > 0) {
        return ResponseUtil.error(
          "Cannot delete district with existing reporters",
          400
        );
      }

      if (existingDistrict._count.articles > 0) {
        return ResponseUtil.error(
          "Cannot delete district with existing articles",
          400
        );
      }

      await this.prisma.district.delete({
        where: { id },
      });

      return ResponseUtil.success(null, "District deleted successfully");
    } catch (error) {
      this.logger.error("Failed to delete district", error.stack);
      return ResponseUtil.error("Failed to delete district", 500);
    }
  }
}
