import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Organization } from "database/entitys/Organization";
import { InputRepository } from "database/repositorys/Input";
import { OrganizationRepository } from "database/repositorys/Organization";
import { Request } from "express";

@Injectable()
export class InputService {
  constructor() {}

  @Inject() private repository: InputRepository;

  async create(body: any) {
    const input = await this.repository._create(body);
    return input;
  }
}
