import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCountryDto } from "../dto/create-country.dto";
import { UpdateCountryDto } from "../dto/update-country.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto): Promise<IResponse> {
    try {
      // Check if country with same name already exists
      const existingCountry = await this.prisma.country.findFirst({
        where: { name: createCountryDto.name },
      });

      if (existingCountry) {
        return ResponseUtil.error("Country with this name already exists", 409);
      }

      const country = await this.prisma.country.create({
        data: createCountryDto,
        include: {
          states: true,
          _count: {
            select: {
              states: true,
              reporters: true,
            },
          },
        },
      });

      return ResponseUtil.success(country, "Country created successfully", 201);
    } catch (error) {
      this.logger.error("Failed to create country", error.stack);
      return ResponseUtil.error("Failed to create country", 500);
    }
  }

  async findAll(): Promise<IResponse> {
    try {
      const countries = await this.prisma.country.findMany({
        include: {
          _count: {
            select: {
              states: true,
              reporters: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return ResponseUtil.success(countries, "Countries retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve countries", error.stack);
      return ResponseUtil.error("Failed to retrieve countries", 500);
    }
  }

  async findOne(id: number): Promise<IResponse> {
    try {
      const country = await this.prisma.country.findUnique({
        where: { id },
        include: {
          states: {
            include: {
              _count: {
                select: {
                  districts: true,
                  reporters: true,
                },
              },
            },
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              states: true,
              reporters: true,
            },
          },
        },
      });

      if (!country) {
        return ResponseUtil.error("Country not found", 404);
      }

      return ResponseUtil.success(country, "Country retrieved successfully");
    } catch (error) {
      this.logger.error("Failed to retrieve country", error.stack);
      return ResponseUtil.error("Failed to retrieve country", 500);
    }
  }

  async update(id: number, updateCountryDto: UpdateCountryDto): Promise<IResponse> {
    try {
      // Check if country exists
      const existingCountry = await this.prisma.country.findUnique({
        where: { id },
      });

      if (!existingCountry) {
        return ResponseUtil.error("Country not found", 404);
      }

      // Check if another country with same name exists
      if (updateCountryDto.name) {
        const duplicateCountry = await this.prisma.country.findFirst({
          where: {
            name: updateCountryDto.name,
            id: { not: id },
          },
        });

        if (duplicateCountry) {
          return ResponseUtil.error("Country with this name already exists", 409);
        }
      }

      const country = await this.prisma.country.update({
        where: { id },
        data: updateCountryDto,
        include: {
          _count: {
            select: {
              states: true,
              reporters: true,
            },
          },
        },
      });

      return ResponseUtil.success(country, "Country updated successfully");
    } catch (error) {
      this.logger.error("Failed to update country", error.stack);
      return ResponseUtil.error("Failed to update country", 500);
    }
  }

  async remove(id: number): Promise<IResponse> {
    try {
      // Check if country exists
      const existingCountry = await this.prisma.country.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              states: true,
              reporters: true,
            },
          },
        },
      });

      if (!existingCountry) {
        return ResponseUtil.error("Country not found", 404);
      }

      // Check if country has dependent records
      if (existingCountry._count.states > 0) {
        return ResponseUtil.error(
          "Cannot delete country with existing states",
          400
        );
      }

      if (existingCountry._count.reporters > 0) {
        return ResponseUtil.error(
          "Cannot delete country with existing reporters",
          400
        );
      }

      await this.prisma.country.delete({
        where: { id },
      });

      return ResponseUtil.success(null, "Country deleted successfully");
    } catch (error) {
      this.logger.error("Failed to delete country", error.stack);
      return ResponseUtil.error("Failed to delete country", 500);
    }
  }
}
