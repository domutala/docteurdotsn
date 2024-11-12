import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { PaypalService } from "apps/paypal/paypal.service";
import { Offer } from "database/entitys/Plan";
import { InputRepository } from "database/repositorys/Input";
import { OrderRepository } from "database/repositorys/Order";
import { OrganizationRepository } from "database/repositorys/Organization";
import { Request } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class OrganizationService {
  @Inject(REQUEST) private request: Request;
  @Inject() private repository: OrganizationRepository;
  @Inject() private orderRepository: OrderRepository;
  @Inject() private inputRepository: InputRepository;
  @Inject() private paypalService: PaypalService;

  async create(body: any) {
    if (body.id) {
      const org = await this.repository._findOne({ id: body.id });
      if (org && org.owner !== this.request.user.uid) {
        throw new UnauthorizedException("not_authorized");
      }
    }

    const organization = await this.repository._create({
      ...body,
      owner: this.request.user.uid,
    });

    return await this.repository._findOne({ id: organization.id });
  }

  async remove(body: any) {
    const organization = await this.repository._findOne({ id: body.id });
    if (!organization) throw new NotFoundException("organization_not_found");

    if (organization.owner !== this.request.user.uid) {
      throw new UnauthorizedException("not_authorized");
    }

    await organization.remove();

    return organization;
  }

  async list() {
    const organizations = await this.repository._find({
      member: this.request.user.uid,
    });

    return await this.repository._removeUnaccessibleData(
      organizations,
      this.request.user.uid,
    );
  }

  async getOrder(params: { id: string }) {
    const order = await this.orderRepository._findOne({ id: params.id });
    return order;
  }

  async createOrder(params: { organizationId: string; plan: string }) {
    const organization = await this.repository._isMember(
      params.organizationId,
      this.request.user.uid,
      { owner: true },
    );

    const plans: { [x: string]: Offer } = JSON.parse(
      readFileSync(join(process.cwd(), "plans.json"), "utf-8"),
    );
    const plan = plans[params.plan];

    if (!plan) throw new BadRequestException("bad_request");

    const orderId = uuidv4();

    const result = await this.paypalService.createOrder({
      amount: plan.amount,
      orderId,
    });

    const order = await this.orderRepository._create({
      id: orderId,
      offer: plan,
      paypalOrder: result.jsonResponse,
      createBy: this.request.user.uid,
      organization,
    });

    return order;
  }

  async captureOrder(params: { orderID: string }) {
    let order = await this.orderRepository._findOne({ id: params.orderID });
    if (!order) throw new NotFoundException("order_not_found");

    const result = await this.paypalService.captureOrder(order.paypalOrder.id);
    if (result.jsonResponse.status !== "COMPLETED") {
      throw new HttpException(
        "order_not_completed",
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    order.paypalOrder.status = result.jsonResponse.status;
    order = await this.orderRepository._create(order);

    return order;
  }

  async getInputs(params: any) {
    const organization = await this.repository._isMember(
      params.organization,
      this.request.user.uid,
      { states: ["accepted"] },
    );

    const input = await this.inputRepository._find(params);
    return input;
  }

  async getStats(params: any) {
    // await this.repository._isMember(params.id, this.request.user.uid, {
    //   states: ["accepted"],
    // });

    const stats = await this.repository._getStats(params);
    return stats;
  }
}
