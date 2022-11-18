import { Column, Entity, PrimaryColumn } from "typeorm";
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

  @Column()
  closedAt: string;

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
