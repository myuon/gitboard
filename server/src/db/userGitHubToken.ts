import { Column, Entity, PrimaryColumn, Repository } from "typeorm";
import { UserGitHubToken } from "../../../shared/model/userGitHubToken";

@Entity()
export class UserGitHubTokenTable {
  @PrimaryColumn({
    length: 100,
  })
  userId: string;

  @Column({
    length: 250,
  })
  token: string;

  @Column()
  updatedAt: number;

  static fromModel(model: UserGitHubToken): UserGitHubTokenTable {
    const record = new UserGitHubTokenTable();
    record.userId = model.userId;
    record.token = model.token;
    record.updatedAt = model.updatedAt;

    return record;
  }

  toModel(): UserGitHubToken {
    return {
      userId: this.userId,
      token: this.token,
      updatedAt: this.updatedAt,
    };
  }
}

export const newUserGitHubTokenRepository = (
  db: Repository<UserGitHubTokenTable>
) => {
  return {
    save: async (model: UserGitHubToken) => {
      return db.save(UserGitHubTokenTable.fromModel(model));
    },
  };
};
