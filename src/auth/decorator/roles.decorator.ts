import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../security/role.guard";
import { JwtAuthGuard } from "../security/auth.guard";

export const ROLES_KEY = "roles";

export const Roles = (...roles: string[]) => {
  return applyDecorators(SetMetadata(ROLES_KEY, roles));
};
