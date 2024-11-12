import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { regexPaswword } from "database/entitys/User";
import { DoctorRepository } from "database/repositorys/Doctor";
import { UserRepository } from "database/repositorys/User";
import { Request } from "express";

@Injectable()
export class DoctorService {
  @Inject(REQUEST) private readonly request: Request;
  @Inject() private repository: DoctorRepository;
  @Inject() private userRepository: UserRepository;

  async signup(params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    passwordRepeat: string;
  }) {
    if (
      !regexPaswword.test(params.password) ||
      params.password !== params.passwordRepeat
    ) {
      throw new BadRequestException("password_is_not_valid");
    }

    const doctor = await this.repository._create(params);

    await this.userRepository._create(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { ...params, doctor },
      { password: params.password, passwordRepeat: params.passwordRepeat },
    );

    return doctor;
  }

  async update(params: any) {
    const doctor = await this.repository._create({
      ...params,
      id: this.request.session.user.doctor.id,
    });
    return doctor;
  }

  //   async getUserByEmail(email: string) {
  //     const user = await this.firebaseAdmin.auth().getUserByEmail(email);
  //     return user;
  //   }
}
