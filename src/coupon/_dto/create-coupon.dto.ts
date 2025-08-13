import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateCouponDTO {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @ApiProperty({
    name: "code",
    example: "WELCOME2025",
    required: false,
    nullable: true,
    description: `
      쿠폰 코드명(최소 5개의 문자+숫자 조합으로 만들어야합니다.)
      * 클라이언트가 특정 쿠폰코드를 입력하지 않으면 7개 랜덤된 문자와 숫자 조합으로 쿠폰코드를 자동생성합니다.
    `,
  })
  code?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "name",
    example: "10% 웰컴 할인 쿠폰",
    required: true,
    nullable: false,
    description: "쿠폰 이름",
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: "description",
    example: "해당 쿠폰은 처음 회원가입을 한 사람에게 발급하는 쿠폰입니다.",
    required: false,
    nullable: true,
    description: "쿠폰의 설명입니다.",
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    name: "isActive",
    example: true,
    required: true,
    nullable: false,
    default: false,
    description:
      "쿠폰의 사용가능 여부 정보입니다. 기본값은 false(비활성) 입니다.",
  })
  isActive: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "discountType",
    example: "PERCENT",
    required: true,
    nullable: false,
    default: "NONE",
    description: `
      쿠폰의 할인 방법 입니다.
      PERCENT(%할인), AMOUNT(금액 할인), NONE(할인 없음)으로 값을 구분합니다.
    `,
  })
  discountType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "discountValue",
    example: "10",
    required: false,
    nullable: true,
    default: null,
    description: `
      쿠폰의 할인 방법에 따른 할인 수 입니다.
      퍼센트의 경우는 소수점이 없는 NumberStirng으로 들어가지만, 금액 할인인 경우에는 소수점 둘째자리까지 값이 등록됩니다.
    `,
  })
  discountValue: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: "minPrice",
    example: "1000.00",
    required: false,
    nullable: true,
    default: null,
    description: "할인 쿠폰 사용 최소 사용금액",
  })
  minPrice?: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    name: "isIssuedLimited",
    example: true,
    required: true,
    nullable: false,
    default: false,
    description: "쿠폰 발행 개수 제한 여부",
  })
  isIssuedLimited: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: "totalCount",
    example: null,
    required: false,
    nullable: true,
    default: null,
    description: "발행 가능 총 개수",
  })
  totalCount?: number;

  // @IsNumber()
  // @IsOptional()
  // @ApiProperty({
  //   name: "issuedCount",
  //   example: 100,
  //   required: false,
  //   nullable: true,
  //   default: 0,
  //   description: "발행한 쿠폰 개수",
  // })
  // issuedCount?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: "remainCount",
    example: 10,
    required: false,
    nullable: true,
    description: "잔여 쿠폰 개수",
  })
  remainCount?: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    name: "isPeriodLimited",
    example: false,
    required: true,
    nullable: false,
    default: false,
    description: "쿠폰 기간 설정 여부",
  })
  isPeriodLimited: boolean;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    name: "startedDt",
    example: "2025-08-05T00:00:00.000Z",
    required: false,
    nullable: true,
    description:
      "쿠폰 사용 시작일 (ISO 8601 형식, 예: 2025-08-05T00:00:00.000Z)",
  })
  startedDt?: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    name: "endedDt",
    example: "2025-08-31T23:59:59.000Z",
    required: false,
    nullable: true,
    description:
      "쿠폰 사용 종료일 (ISO 8601 형식, 예: 2025-08-31T23:59:59.000Z)",
  })
  endedDt?: Date;
}
