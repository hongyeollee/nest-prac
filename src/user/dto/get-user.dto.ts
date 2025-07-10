import { PickType } from "@nestjs/swagger";
import { CreateUserDTO } from "./create-user.dto";

export class GetUserDTO extends PickType(CreateUserDTO, ["email"]) {}
