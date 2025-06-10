import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateStateDto } from "../dto/create-state.dto";
import { UpdateStateDto } from "../dto/update-state.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";

@Injectable()
export class StatesService {
  private readonly logger = new Logger(StatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createStateDto: CreateStateDto): Promise<IResponse> {
    try {
      // Check if country exists
      const country = await this.prisma.country.findUnique({
        where: { id: createStateDto.countryId },
      });

      if (!country) {
        return ResponseUtil.error("Country not found", 404);
      }

      // Check if state with same name already exists in this country
      const existingState = await this.prisma.state.findFirst({
        where: {
          name: createStateDto.name,
          countryId: createStateDto.countryId,
        },
      });

      if (existingState) {
        return ResponseUtil.error(
          "State with this name already exists in this country",
          409
        );
      }

      const state = await this.prisma.state.create({
        data: createStateDto,
        include: {
          country: true,
          _count: {
            select: {
              districts: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(state, "State created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create state", error.stack);
      return ResponseUtil.error("Failed to create state", 500);
    }
  }

  async findAll(countryId?: number): Promise<IResponse> {
    try {
      const whereClause = countryId ? { countryId } : {};

      const states = await this.prisma.state.findMany({
        where: whereClause,
        include: {
          country: true,
          _count: {
            select: {
              districts: true,
              reporters: true,
              articles: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return ResponseUtil.success(states, "States retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve states", error.stack);
      return ResponseUtil.error("Failed to retrieve states", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const state = await this.prisma.state.findUnique({
        where: { id },
        include: {
          country: true,
          districts: {
            include: {
              _count: {
                select: {
                  constituencies: true,
                  reporters: true,
                },
              },
            },
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              districts: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!state) {
        return ResponseUtil.error("State not found", 404);
      }

      return ResponseUtil.success(state, "State retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve state", error.stack);
      return ResponseUtil.error("Failed to retrieve state", 500);
    }
  }

  async update(id: number, updateStateDto: UpdateStateDto): Promise<IResponse> {
    try {
      // Check if state exists
      const existingState = await this.prisma.state.findUnique({
        where: { id },
      });

      if (!existingState) {
        return ResponseUtil.error("State not found", 404);
      }

      // Check if country exists (if countryId is being updated)
      if (updateStateDto.countryId) {
        const country = await this.prisma.country.findUnique({
          where: { id: updateStateDto.countryId },
        });

        if (!country) {
          return ResponseUtil.error("Country not found", 404);
        }
      }

      // Check if another state with same name exists in the same country
      if (updateStateDto.name || updateStateDto.countryId) {
        const countryId = updateStateDto.countryId || existingState.countryId;
        const name = updateStateDto.name || existingState.name;

        const duplicateState = await this.prisma.state.findFirst({
          where: {
            name,
            countryId,
            id: { not: id },
          },
        });

        if (duplicateState) {
          return ResponseUtil.error(
            "State with this name already exists in this country",
            409
          );
        }
      }

      const state = await this.prisma.state.update({
        where: { id },
        data: updateStateDto,
        include: {
          country: true,
          _count: {
            select: {
              districts: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      return ResponseUtil.success(state, "State updated successfully");
    } catch (error) {
      this.logger.error("Failed to update state", error.stack);
      return ResponseUtil.error("Failed to update state", 500);
    }
  }

  async remove(id: number): Promise<IResponse> {
    try {
      // Check if state exists
      const existingState = await this.prisma.state.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              districts: true,
              reporters: true,
              articles: true,
            },
          },
        },
      });

      if (!existingState) {
        return ResponseUtil.error("State not found", 404);
      }

      // Check if state has dependent records
      if (existingState._count.districts > 0) {
        return ResponseUtil.error(
          "Cannot delete state with existing districts",
          400
        );
      }

      if (existingState._count.reporters > 0) {
        return ResponseUtil.error(
          "Cannot delete state with existing reporters",
          400
        );
      }

      if (existingState._count.articles > 0) {
        return ResponseUtil.error(
          "Cannot delete state with existing articles",
          400
        );
      }

      await this.prisma.state.delete({
        where: { id },
      });

      return ResponseUtil.success(null, "State deleted successfully");
    } catch (error) {
      this.logger.error("Failed to delete state", error.stack);
      return ResponseUtil.error("Failed to delete state", 500);
    }
  }
}
