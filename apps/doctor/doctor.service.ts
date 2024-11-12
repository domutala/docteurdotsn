import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { regexPaswword } from "database/entitys/User";
import { DoctorRepository } from "database/repositorys/Doctor";
import { UserRepository } from "database/repositorys/User";

@Injectable()
export class DoctorService {
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

    const doctor = await this.repository._register(params);

    await this.userRepository._create(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { ...params, doctor },
      { password: params.password, passwordRepeat: params.passwordRepeat },
    );

    return doctor;
  }

  //   async getUser(uid: string) {
  //     const user = await this.firebaseAdmin.auth().getUser(uid);
  //     return user;
  //   }

  //   async getUserByEmail(email: string) {
  //     const user = await this.firebaseAdmin.auth().getUserByEmail(email);
  //     return user;
  //   }
}
