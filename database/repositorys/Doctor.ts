import { Doctor } from "database/entitys/Doctor";
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { BaseRepository } from "./Base";
import { DataSource } from "typeorm";

@Injectable()
export class DoctorRepository extends BaseRepository<Doctor> {
  constructor(dataSource: DataSource) {
    super(dataSource, Doctor);
  }

  async _create(params: Partial<Doctor>) {
    let doctor = new Doctor();

    if (params.id) {
      doctor = await this._findOne({ id: params.id });
      if (!doctor) throw new NotFoundException("doctor_not_found");
    } else {
      if (await this._findOne({ email: params.email })) {
        throw new NotAcceptableException(
          "doctor_with_email_already_registered",
        );
      }

      doctor.email = params.email;
    }

    doctor.firstName = params.firstName || doctor.firstName;
    doctor.lastName = params.lastName || doctor.lastName;
    doctor.photo = params.photo || doctor.photo;
    doctor.description = params.description || doctor.description;
    doctor.specialty = params.specialty || doctor.specialty;

    if (!doctor.username) {
      doctor.username = `${doctor.firstName}${doctor.lastName}`.replace(
        /[a-zA-Z]/g,
        "",
      );

      while (await this._findOne({ username: params.username })) {
        doctor.username = `${doctor.username}-${Math.random().toString().substring(2, 8)}`;
      }
    }

    await doctor.save();
    return doctor;
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("doctor");
    // queryBuilder.leftJoinAndSelect("doctor.model", "model");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `doctor.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.email) {
      params.emails ||= [];
      params.emails.push(params.email);
    }
    if (params.emails) {
      queryBuilder.andWhere(
        `doctor.email IN (${params.emails.map((email: string) => `'${email}'`).join(",")})`,
      );
    }

    if (params.username) {
      params.usernames ||= [];
      params.usernames.push(params.username);
    }
    if (params.usernames) {
      queryBuilder.andWhere(
        `doctor.username IN (${params.usernames.map((username: string) => `'${username}'`).join(",")})`,
      );
    }

    const doctors = await queryBuilder.getMany();

    return doctors;
  }
}
