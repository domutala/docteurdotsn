import { MemberState, Organization } from "database/entitys/Organization";
import { DataSource, Repository } from "typeorm";
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import * as dayjs from "dayjs";
import { ModelRepository } from "./Model";
import { InputRepository } from "./Input";

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
  constructor(dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  @Inject() private modelRepository: ModelRepository;
  @Inject() private inputRepository: InputRepository;

  async _create(params: Organization) {
    let organization: Organization;

    if (params.id) organization = await this._findOne({ id: params.id });
    if (!organization) {
      organization = new Organization();
      params.members = [{ uid: params.owner, state: "accepted", owner: true }];
      organization.members = params.members;
      organization.owner = params.owner;
    }

    organization.id = params.id || params.id;
    organization.name = params.name || params.name;

    await organization.save();
    return organization;
  }

  async _addMember(params: { id: string; member: string }) {
    const organization = await this._findOne({ id: params.id });
    if (!organization) throw new NotFoundException("organization_not_found");

    organization.members ||= [];

    const isMember = organization.members.findIndex(
      (m) => m.uid === params.member,
    );

    if (
      isMember !== -1 &&
      !["disabled", "declined", "leave"].includes(
        organization.members[isMember].state,
      )
    ) {
      throw new ConflictException("user_already_member");
    }

    if (isMember === -1) {
      organization.members.push({ uid: params.member, state: "invited" });
    } else {
      organization.members[isMember] = { uid: params.member, state: "invited" };
    }

    await organization.save();
    return organization;
  }

  async _setMemeberState(params: {
    id: string;
    member: string;
    state: MemberState;
  }) {
    if (!["accepted", "declined", "leave", "disabled"].includes(params.state)) {
      throw new BadRequestException("bad_request");
    }

    const organization = await this._findOne({ id: params.id });
    if (!organization) throw new NotFoundException("organization_not_found");

    organization.members ||= [];

    const i = organization.members.findIndex((m) => m.uid === params.member);
    if (i === -1) throw new NotFoundException("member_not_found");

    // le state du owner ne peut être modifier
    if (organization.members[i].owner) {
      throw new UnauthorizedException("not_authorized");
    }

    if (
      ["accepted", "declined"].includes(params.state) &&
      organization.members[i].state !== "invited"
    ) {
      /**
       * si state est égale à "accepted" ou "declined",
       * les state actuel du membre doit être égale à "invited"
       * */
      throw new BadRequestException("bad_request");
    } else if (
      /**
       * si le state est égale à "leave" il faut que
       * l'état actuel soit égale à "accepted"
       */
      ["leave"].includes(params.state) &&
      organization.members[i].state !== "accepted"
    ) {
      throw new BadRequestException("bad_request");
    }

    organization.members[i].state = params.state;

    await organization.save();
    return organization;
  }

  /** vérifier qu'un utilisateur est membre d'une organisation */
  async _isMember(
    organizationId: string,
    memberUid: string,
    options: { states?: MemberState[]; owner?: boolean } = {},
  ) {
    const organization = await this._findOne({ id: organizationId });
    if (!organization) throw new UnauthorizedException("not_authorized");

    const i = organization.members.findIndex((m) => m.uid === memberUid);
    if (i === -1) throw new UnauthorizedException("not_authorized");

    if (
      options.states &&
      !options.states.includes(organization.members[i].state)
    ) {
      throw new UnauthorizedException("not_authorized");
    }

    if (options.owner && !organization.members[i].owner) {
      throw new UnauthorizedException("not_authorized");
    }

    return organization;
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
    const queryBuilder = this.createQueryBuilder("organization");
    queryBuilder.leftJoinAndSelect("organization.models", "models");
    queryBuilder.leftJoinAndSelect("organization.plans", "plans");
    queryBuilder.leftJoinAndSelect("plans.order", "order");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `organization.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.member) {
      queryBuilder.andWhere(
        `EXISTS (
        SELECT 1 FROM json_array_elements(organization.members) as j 
        WHERE j->>'uid' = :uid
      )`,
        { uid: params.member },
      );
    }

    queryBuilder.orderBy("organization.createdAt", "ASC");

    const organizations = await queryBuilder.getMany();

    return organizations;
  }

  async _getStats(params: {
    id: string;
    modelIntervalle?: [string, string];

    inputModel: string;
    inputIntervalle?: [string, string];
  }) {
    const queryBuilder = this.createQueryBuilder("organization");

    const organization = await queryBuilder.getOne();

    if (organization) {
      const models = await this.modelRepository._find({
        organization: organization.id,
        intervalle: params.modelIntervalle,
        noOrganization: true,
      });

      const inputs = await this.inputRepository._find({
        models: models.map((model) => model.id),
        intervalle: params.inputIntervalle,
      });

      return {
        models,
        inputs,
        meta: {
          models: models.map((model) => {
            return {
              id: model.id,
              createdAt: model.createdAt,
              inputs: inputs.filter((i) => i.model.id === model.id).length,
            };
          }),
          inputs: inputs.map((input) => {
            return {
              id: input.id,
              createdAt: input.createdAt,
              model: input.model.id,
            };
          }),
        },
      };
    }

    return;
  }

  async _removeUnaccessibleData(
    organizations: Organization[],
    userUid: string,
  ) {
    // si linvitation n'est pas acceptée, supprimer les membres et les modèles
    organizations = organizations.map((organization) => {
      const myMember = organization.members.filter(
        (member) => member.uid === userUid,
      )[0];

      if (myMember.state !== "accepted") {
        const members = [];
        const owner = organization.members.filter(
          (member) => member.owner === true,
        )[0];
        if (owner) members.push(owner);

        members.push(myMember);

        organization.members = members;
        organization.models = [];
        organization.plans = [];
      }

      return organization;
    });

    return organizations;
  }

  _findClosestFuturePlan(organization: Organization) {
    if (!organization.plans.length) return;

    let lastPlan = organization.plans[0];

    for (const plan of organization.plans) {
      if (dayjs(plan.endAt).isAfter(lastPlan.endAt)) lastPlan = plan;
    }

    return lastPlan;
  }
}
