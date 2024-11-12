import { Input } from "database/entitys/Input";
import { DataSource, Repository } from "typeorm";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ModelRepository } from "./Model";
import * as dayjs from "dayjs";

@Injectable()
export class InputRepository extends Repository<Input> {
  constructor(dataSource: DataSource) {
    super(Input, dataSource.createEntityManager());
  }

  @Inject() private modelRepository: ModelRepository;

  async _create(params: { [x: string]: any }) {
    const input = new Input();

    const model = await this.modelRepository._findOne({ id: params.model });
    if (!model) throw new NotFoundException("model_not_found");

    input.values = params.values || input.values;
    input.model = params.model || input.model;

    await input.save();
    return input;
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const sessions = await this._find(params);

    return sessions[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("input");

    if (!params.noModel) queryBuilder.leftJoinAndSelect("input.model", "model");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids && params.ids.length) {
      queryBuilder.andWhere(
        `input.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.model) {
      params.models ||= [];
      params.models.push(params.model);
    }
    if (params.models && params.models.length) {
      queryBuilder.andWhere(
        `input.modelId IN (${params.models.map((model: string) => `'${model}'`).join(",")})`,
      );
    }

    if (params.intervalle && params.intervalle.length === 2) {
      const [startDate, endDate] = params.intervalle;

      queryBuilder.andWhere("input.createdAt BETWEEN :startDate AND :endDate", {
        startDate: dayjs(startDate).toDate(),
        endDate: dayjs(endDate).toDate(),
      });
    }

    if (params._q) {
      queryBuilder.andWhere(
        "unaccent(input.values::text) ILIKE unaccent(:keyword)",
        { keyword: `%${params._q}%` },
      );
    }

    if (params.orderByValuesKey) {
      const keys = params.orderByValuesKey as {
        key: string;
        sort?: "ASC" | "DESC";
      }[];

      for (const key of keys) {
        if (key.sort) {
          queryBuilder.addOrderBy(
            `input.values ->>'${key.key}'`,
            key.sort.toUpperCase() as "ASC",
          );
        }
      }
    } else queryBuilder.orderBy("input.createdAt", "DESC");

    const sessions = await queryBuilder.getMany();

    return sessions;
  }
}
