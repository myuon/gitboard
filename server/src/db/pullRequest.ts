import {
  Between,
  Column,
  Entity,
  In,
  PrimaryColumn,
  Repository,
} from "typeorm";
import { PullRequest } from "../../../shared/model/pullRequest";

@Entity()
export class PullRequestTable {
  @PrimaryColumn()
  id: string;

  @Column()
  owner: string;

  @Column()
  repositoryId: string;

  @Column()
  number: number;

  @Column()
  title: string;

  @Column()
  state: string;

  @Column()
  url: string;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  closedAt?: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  static fromModel(model: PullRequest): PullRequestTable {
    const record = new PullRequestTable();
    record.id = model.id;
    record.owner = model.owner;
    record.repositoryId = model.repositoryId;
    record.number = model.number;
    record.title = model.title;
    record.state = model.state;
    record.url = model.url;
    record.createdBy = model.createdBy;
    record.closedAt = model.closedAt;
    record.createdAt = model.createdAt;
    record.updatedAt = model.updatedAt;

    return record;
  }

  toModel(): PullRequest {
    return {
      id: this.id,
      owner: this.owner,
      repositoryId: this.repositoryId,
      number: this.number,
      title: this.title,
      state: this.state,
      url: this.url,
      createdBy: this.createdBy,
      closedAt: this.closedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const newPullRequestRepository = (db: Repository<PullRequestTable>) => {
  return {
    findBy: async (where: {
      owner: string[];
      createdBy?: string;
      createdAt: {
        start: string;
        end: string;
      };
    }) => {
      const r = await db.findBy({
        owner: In(where.owner),
        createdBy: where.createdBy,
        createdAt: Between(where.createdAt.start, where.createdAt.end),
      });

      return r.map((r) => r.toModel());
    },
    findLeadTime: async (where: { owner: string[]; ids: string[] }) => {
      const r = await db
        .createQueryBuilder()
        .select("pull_request_table.id", "id")
        .addSelect("pull_request_table.closedAt", "closedAt")
        .addSelect("MIN(commit_table.committedDate)", "firstCommitDate")
        .from(PullRequestTable, "pull_request_table")
        .innerJoin(
          "commit_pull_request_relation_table",
          "commit_pull_request_relation_table",
          "pull_request_table.id = commit_pull_request_relation_table.pullRequestId"
        )
        .innerJoin(
          "commit_table",
          "commit_table",
          "commit_pull_request_relation_table.commitId = commit_table.id"
        )
        .where("pull_request_table.owner in (:...owner)", {
          owner: where.owner,
        })
        .andWhere("pull_request_table.id in (:...ids)", { ids: where.ids })
        .groupBy("pull_request_table.id")
        .getRawMany();

      return r;
    },
    save: async (model: PullRequest) => {
      const r = await db.save(PullRequestTable.fromModel(model));

      return r.toModel();
    },
  };
};
