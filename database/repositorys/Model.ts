import { Model } from "database/entitys/Model";
import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";

@Injectable()
export class ModelRepository extends Repository<Model> {
  constructor(dataSource: DataSource) {
    super(Model, dataSource.createEntityManager());
  }

  async _create(params: Model) {
    let model: Model;

    if (params.id) model = await this._findOne({ id: params.id });
    if (!model) model = new Model();

    model.id = params.id || model.id;
    model.title = params.title || model.title;
    model.logo = params.logo || model.logo;
    model.schemaOptions = params.schemaOptions || model.schemaOptions;
    model.base = params.base || model.base;
    model.metas = params.metas || model.metas;
    model.createBy = params.createBy || model.createBy;
    model.organization = params.organization || model.organization;
    model.interfaces = params.interfaces || model.interfaces;

    await model.save();
    return model;
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
    const queryBuilder = this.createQueryBuilder("model");

    if (!params.noOrganization) {
      queryBuilder.leftJoinAndSelect("model.organization", "organization");
    }

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids && params.ids.length) {
      queryBuilder.andWhere(
        `model.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.organization) {
      params.organizations ||= [];
      params.organizations.push(params.organization);
    }
    if (params.organizations) {
      queryBuilder.andWhere(
        `model.organizationId IN (${params.organizations.map((organization: string) => `'${organization}'`).join(",")})`,
      );
    }

    if (params.intervalle && params.intervalle.length === 2) {
      const [startDate, endDate] = params.intervalle;

      queryBuilder.andWhere("model.createdAt BETWEEN :startDate AND :endDate", {
        startDate: dayjs(startDate).toDate(),
        endDate: dayjs(endDate).toDate(),
      });
    }

    queryBuilder.orderBy("model.createdAt", "ASC");

    const sessions = await queryBuilder.getMany();

    return sessions;
  }
}
