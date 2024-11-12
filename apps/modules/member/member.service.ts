import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { FirebaseAuthService } from "apps/firebase/admin.service";
import { MemberState } from "database/entitys/Organization";
import { OrganizationRepository } from "database/repositorys/Organization";
import { Request } from "express";

@Injectable()
export class MemberService {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  @Inject() private organizationRepository: OrganizationRepository;
  @Inject(REQUEST) private request: Request;

  async get(params: { organization: string; uid: string }) {
    const organization = await this.organizationRepository._isMember(
      params.organization,
      this.request.user.uid,
    );

    const user = await this.firebaseAuthService.getUser(params.uid);
    if (!user) throw new NotFoundException("user_not_found");

    // vérifier que l'utilisateur remonté depuis firebse est membre de l'organisation
    if (!organization.members.map((m) => m.uid).includes(user.uid)) {
      throw new UnauthorizedException("not_authorized");
    }

    return user;
  }

  async invite(params: { organization: string; email: string }) {
    let organization = await this.organizationRepository._isMember(
      params.organization,
      this.request.user.uid,
      { owner: true },
    );

    const user = await this.firebaseAuthService.getUserByEmail(params.email);
    if (!user) throw new NotFoundException("user_not_found");

    organization = await this.organizationRepository._addMember({
      id: organization.id,
      member: user.uid,
    });

    return organization;
  }

  async setState(params: {
    organization: string;
    state: MemberState;
    uid: string;
  }) {
    let organization = await this.organizationRepository._isMember(
      params.organization,
      this.request.user.uid,
      {
        // seul le propriétaire peut désactivier un membre
        owner: params.state === "disabled",
      },
    );

    organization = await this.organizationRepository._setMemeberState({
      id: params.organization,
      member: params.uid,
      state: params.state,
    });

    organization = (
      await this.organizationRepository._removeUnaccessibleData(
        [organization],
        this.request.user.uid,
      )
    )[0];

    return organization;
  }
}
