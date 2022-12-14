import { Column, Entity, PrimaryColumn, Repository } from "typeorm";
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

export const newUserOwnerRelationRepository = (
  db: Repository<UserOwnerRelationTable>
) => {
  return {
    findByUserId: async (where: { userId: string }) => {
      const r = await db.findBy(where);

      return r.map((r) => r.toModel());
    },
    findAll: async () => {
      const r = await db.find();

      return r.map((r) => r.toModel());
    },
    save: async (model: UserOwnerRelation) => {
      const r = await db.save(UserOwnerRelationTable.fromModel(model));

      return r.toModel();
    },
    delete: async (model: UserOwnerRelation) => {
      const record = UserOwnerRelationTable.fromModel(model);
      await db.delete({ owner: record.owner, userId: record.userId });
    },
  };
};
