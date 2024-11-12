import { Doctor } from "database/entitys/Doctor";
import { DataSource, EntityTarget, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BaseRepository<T> extends Repository<T> {
  constructor(dataSource: DataSource, entity: EntityTarget<T>) {
    super(entity, dataSource.createEntityManager());
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const doctors = await this._find(params);

    return doctors[0] as T;
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder();

    const doctors = await queryBuilder.getMany();
    return doctors;
  }
}
