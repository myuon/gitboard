import { Column, Entity, PrimaryColumn } from "typeorm";
import { UserOwnerRelation } from "../../../shared/model/userOwnerRelation";

@Entity()
export class UserOwnerRelationTable {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  owner: string;

  @Column()
  createdAt: number;

  static fromModel(model: UserOwnerRelation): UserOwnerRelationTable {
    const record = new UserOwnerRelationTable();
    record.userId = model.userId;
    record.owner = model.owner;
    record.createdAt = model.createdAt;

    return record;
  }

  toModel(): UserOwnerRelation {
    return {
      userId: this.userId,
      owner: this.owner,
      createdAt: this.createdAt,
    };
  }
}
