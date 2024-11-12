import { regexPaswword, User } from "database/entitys/User";
import { DataSource } from "typeorm";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Doctor } from "database/entitys/Doctor";
import { sendMail } from "utils/mailer";
import jwt, { verify } from "utils/jwt";
import { BaseRepository } from "./Base";
import forge from "utils/forge";

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }

  static comparePassword(password: string | string[], givenPassword: string) {
    const _password = forge.decrypter(password);
    return _password === givenPassword;
  }

  async _create(
    params: Partial<User>,
    password?: { password?: string; passwordRepeat?: string },
  ) {
    let user = new User();

    if (params.id) {
      user = await this._findOne({ id: params.id });
      if (!user) throw new NotFoundException("user_not_found");
    }

    if (
      password.password &&
      (!regexPaswword.test(password.password) ||
        password.password !== password.passwordRepeat)
    ) {
      throw new BadRequestException("passwords_not_matched");
    }

    if (password.password) {
      const pwd = forge.encrypter(password.password);
      user.password = { value: pwd };
    }

    console.log(user.password);

    user.email = params.email || params.email;
    user.doctor = params.doctor || params.doctor;

    await user.save();

    if (!params.id) {
      await sendMail({
        text: `${process.env.BASE_URL}/user/confirmation/${jwt.sign(user.id)}`,
        to: user.email,
        subject: "Account confirmation",
      });
    }

    return user;
  }

  async _confirmation(token: string) {
    const id = verify(token) as { id: string };

    const user = await this._findOne(id);
    if (!user) throw new ForbiddenException("not_authorized");

    if (user.confirmed) throw new ForbiddenException("user_already_confirmed");

    user.confirmed = true;

    await user.save();

    return user;
  }

  async _find(params: { [x: string]: any; join?: string[] } = {}) {
    const queryBuilder = this.createQueryBuilder("user");

    if (Array.isArray(params.join)) {
      for (const join of params.join) {
        queryBuilder.leftJoinAndSelect(`user.${join}`, join);
      }
    }

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `user.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.email) {
      params.emails ||= [];
      params.emails.push(params.email);
    }
    if (params.emails) {
      queryBuilder.andWhere(
        `user.email IN (${params.emails.map((email: string) => `'${email}'`).join(",")})`,
      );
    }

    const users = await queryBuilder.getMany();

    return users;
  }
}
