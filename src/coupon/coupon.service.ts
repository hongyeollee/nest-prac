import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CreateCouponDTO } from "./_dto/create-coupon.dto";
import { Payload } from "src/auth/security/user.payload.interface";
import { CommonUtil } from "src/_common/common.util";
import { CouponEntity } from "entities/coupons/coupon.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";
import { UpdateCouponDTO } from "./_dto/update-coupon.dto";
import { ResponseSuccessGetCouponListDTO } from "./_dto/response-success-get-coupon-list.dto";
import { ResponseSuccessGetCouponDTO } from "./_dto/response-success-get-coupon.dto";

@Injectable()
export class CouponService {
  private strings =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";
  constructor(
    private readonly dataSource: DataSource,
    private readonly commonUtil: CommonUtil,

    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
  ) {}

  async createCoupon(
    createCouponDto: CreateCouponDTO,
    user: Payload,
  ): Promise<CouponEntity> {
    const { code, ...restDto } = createCouponDto;

    if (code) {
      const existCouponCode = await this.couponRepository.findOne({
        where: { code },
      });
      if (existCouponCode) {
        throw new ConflictException("already exist coupon code");
      }
    }

    const couponCode = await this.uniqueCouponCode(code);

    const coupon = this.couponRepository.create({
      code: couponCode,
      issuedUserId: user.id,
      ...restDto,
    });

    const savedCoupon = await this.couponRepository.save(coupon);

    return savedCoupon;
  }

  async deleteCoupon(id: number): Promise<ResponseCommonSuccessDTO> {
    const couponInfo = await this.findOneById(id);

    if (!couponInfo) {
      throw new NotFoundException("not eixst coupon info");
    }

    await this.couponRepository.softDelete({ id });

    return {
      message: "success",
      statusCode: HttpStatus.OK,
    };
  }

  async updateCoupon(
    id: number,
    updateCouponDto: UpdateCouponDTO,
  ): Promise<ResponseCommonSuccessDTO> {
    const { ...restParam } = updateCouponDto;
    const couponInfo = await this.findOneById(id);

    if (!couponInfo) {
      throw new NotFoundException("not eixst coupon info");
    }

    const code = updateCouponDto.code;
    if (code && code !== couponInfo.code) {
      const existedCode = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code },
        withDeleted: true,
      });
      if (existedCode)
        throw new ConflictException("already existed coupon code");
    }

    await this.couponRepository.update({ id }, { ...restParam });

    return {
      message: "success",
      statusCode: HttpStatus.OK,
    };
  }

  async getCoupon(id: number): Promise<ResponseSuccessGetCouponDTO> {
    const couponInfo = await this.findOneById(id);

    if (!couponInfo) {
      throw new NotFoundException("not eixst coupon info");
    }

    delete couponInfo.deletedDt;
    return couponInfo;
  }

  async getCouponList(
    page: number = 1,
    limit: number = 10,
    orderBy: "DESC" | "ASC" = "DESC",
  ): Promise<ResponseSuccessGetCouponListDTO> {
    const [coupons, totalCount] = await this.couponRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdDt: orderBy },
    });

    const refinedCopupons = coupons.map(
      ({ issuedUserId, deletedDt, user, ...rest }) => rest,
    );

    return {
      data: refinedCopupons,
      totalCount,
      currPage: page,
      totalPage: Math.ceil(totalCount / limit),
    };
  }

  private async uniqueCouponCode(code: string): Promise<string> {
    let unique = false;
    let finalCode = code;

    while (!unique) {
      const exists = await this.couponRepository.findOne({
        where: { code: finalCode },
        withDeleted: true,
      });

      if (!exists) {
        unique = true;
      } else {
        finalCode = this.commonUtil.generateRandomString(7, this.strings);
      }
    }

    return finalCode;
  }

  async findOneById(id: number): Promise<CouponEntity> {
    return await this.couponRepository.findOne({
      where: { id },
      withDeleted: false, //삭제된 쿠폰들에 대한 정보까지에 대해서는 필요한 경우 withDeleted: true,
    });
  }
}
