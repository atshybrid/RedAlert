import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateMandalDto } from "../dto/create-mandal.dto";
import { UpdateMandalDto } from "../dto/update-mandal.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";

@Injectable()
export class MandalsService {
  private readonly logger = new Logger(MandalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMandalDto: CreateMandalDto): Promise<IResponse> {
    try {
      // Check if constituency exists
      const constituency = await this.prisma.constituency.findUnique({
        where: { id: createMandalDto.constituencyId },
      });

      if (!constituency) {
        return ResponseUtil.error("Constituency not found", 404);
      }

      // Check if mandal with same name already exists in this constituency
      const existingMandal = await this.prisma.mandal.findFirst({
        where: {
          name: createMandalDto.name,
          constituencyId: createMandalDto.constituencyId,
        },
      });

      if (existingMandal) {
        return ResponseUtil.error(
          "Mandal with this name already exists in this constituency",
          409
        );
      }

      const mandal = await this.prisma.mandal.create({
        data: createMandalDto,
        include: {
          constituency: {
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
            },
          },
          _count: {
            select: {
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(mandal, "Mandal created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create mandal", error.stack);
      return ResponseUtil.error("Failed to create mandal", 500);
    }
  }

  async findAll(constituencyId?: number): Promise<IResponse> {
    try {
      const whereClause = constituencyId ? { constituencyId } : {};

      const mandals = await this.prisma.mandal.findMany({
        where: whereClause,
        include: {
          constituency: {
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
            },
          },
          _count: {
            select: {
              reporters: true,
              articles: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return ResponseUtil.success(mandals, "Mandals retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve mandals", error.stack);
      return ResponseUtil.error("Failed to retrieve mandals", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const mandal = await this.prisma.mandal.findUnique({
        where: { id },
        include: {
          constituency: {
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
            },
          },
          _count: {
            select: {
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!mandal) {
        return ResponseUtil.error("Mandal not found", 404);
      }

      return ResponseUtil.success(mandal, "Mandal retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve mandal", error.stack);
      return ResponseUtil.error("Failed to retrieve mandal", 500);
    }
  }

  async update(id: number, updateMandalDto: UpdateMandalDto): Promise<IResponse> {
    try {
      // Check if mandal exists
      const existingMandal = await this.prisma.mandal.findUnique({
        where: { id },
      });

      if (!existingMandal) {
        return ResponseUtil.error("Mandal not found", 404);
      }

      // Check if constituency exists (if constituencyId is being updated)
      if (updateMandalDto.constituencyId) {
        const constituency = await this.prisma.constituency.findUnique({
          where: { id: updateMandalDto.constituencyId },
        });

        if (!constituency) {
          return ResponseUtil.error("Constituency not found", 404);
        }
      }

      // Check if another mandal with same name exists in the same constituency
      if (updateMandalDto.name || updateMandalDto.constituencyId) {
        const constituencyId = updateMandalDto.constituencyId || existingMandal.constituencyId;
        const name = updateMandalDto.name || existingMandal.name;

        const duplicateMandal = await this.prisma.mandal.findFirst({
          where: {
            name,
            constituencyId,
            id: { not: id },
          },
        });

        if (duplicateMandal) {
          return ResponseUtil.error(
            "Mandal with this name already exists in this constituency",
            409
          );
        }
      }

      const mandal = await this.prisma.mandal.update({
        where: { id },
        data: updateMandalDto,
        include: {
          constituency: {
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
            },
          },
          _count: {
            select: {
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(mandal, "Mandal updated successfully");
    } catch (error) {
      this.logger.error("Failed to update mandal", error.stack);
      return ResponseUtil.error("Failed to update mandal", 500);
    }
  }

  async remove(id: number): Promise<IResponse> {
    try {
      // Check if mandal exists
      const existingMandal = await this.prisma.mandal.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!existingMandal) {
        return ResponseUtil.error("Mandal not found", 404);
      }

      // Check if mandal has dependent records
      if (existingMandal._count.reporters > 0) {
        return ResponseUtil.error(
          "Cannot delete mandal with existing reporters",
          400
        );
      }

      if (existingMandal._count.articles > 0) {
        return ResponseUtil.error(
          "Cannot delete mandal with existing articles",
          400
        );
      }

      await this.prisma.mandal.delete({
        where: { id },
      });

      return ResponseUtil.success(null, "Mandal deleted successfully");
    } catch (error) {
      this.logger.error("Failed to delete mandal", error.stack);
      return ResponseUtil.error("Failed to delete mandal", 500);
    }
  }
}
