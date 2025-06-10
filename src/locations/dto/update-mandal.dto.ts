import { PartialType } from "@nestjs/mapped-types";
import { CreateMandalDto } from "./create-mandal.dto";

export class UpdateMandalDto extends PartialType(CreateMandalDto) {}
