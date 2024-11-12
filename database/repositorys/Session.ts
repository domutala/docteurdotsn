import { Session } from "database/entitys/Session";
import { DataSource, Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { BaseRepository } from "./Base";

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(dataSource: DataSource) {
    super(dataSource, Session);
  }

  async _add(publicKey: string) {
    const session = new Session();
    session.publicKey = publicKey;

    await session.save();

    return session;
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

  async _update(id: string, params: Partial<Session> = {}) {
    const session = await this._findOne({ id });
    if (!session) throw new NotFoundException("session_not_found");

    session.user = params.user || session.user;
    session.closed = params.closed || session.closed;

    await session.save();

    return session;
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("session");
    queryBuilder.leftJoinAndSelect("session.user", "user");
    queryBuilder.leftJoinAndSelect("user.doctor", "doctor");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `session.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    const sessions = await queryBuilder.getMany();

    return sessions;
  }
}
