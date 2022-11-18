import { Entity, PrimaryColumn } from "typeorm";
import { CommitPullRequestRelation } from "../../../shared/model/commitPullRequstRelation";

@Entity()
export class CommitPullRequestRelationTable {
  @PrimaryColumn()
  commitId: string;

  @PrimaryColumn()
  pullRequestId: string;

  static fromModel(
    model: CommitPullRequestRelation
  ): CommitPullRequestRelationTable {
    const record = new CommitPullRequestRelationTable();
    record.commitId = model.commitId;
    record.pullRequestId = model.pullRequestId;

    return record;
  }

  toModel(): CommitPullRequestRelation {
    return {
      commitId: this.commitId,
      pullRequestId: this.pullRequestId,
    };
  }
}
