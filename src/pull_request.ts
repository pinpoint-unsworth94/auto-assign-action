import * as github from '@actions/github'
import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'

export class PullRequest {
  private client: github.GitHub
  private context: Context

  constructor(client: github.GitHub, context: Context) {
    this.client = client
    this.context = context
  }

  async addReviewers(reviewers: string[]): Promise<void> {
    core.debug(JSON.stringify(this.context))

    const { owner, repo } = this.context.issue

    const pull_number = this.getPullRequestNumber()
    if (pull_number === 0) {
      throw new Error('No PR Number found...')
    }

    const result = await this.client.pulls.createReviewRequest({
      owner,
      repo,
      pull_number,
      reviewers,
    })

    core.debug(JSON.stringify(result))
  }

  async addAssignees(assignees: string[]): Promise<void> {
    const { owner, repo } = this.context.issue

    const issue_number = this.getPullRequestNumber()
    if (issue_number === 0) {
      throw new Error('No PR Number found...')
    }

    const result = await this.client.issues.addAssignees({
      owner,
      repo,
      issue_number,
      assignees,
    })
    core.debug(JSON.stringify(result))
  }

  hasAnyLabel(labels: string[]): boolean {
    if (!this.context.payload.pull_request) {
      return false
    }
    const { labels: pullRequestLabels = [] } = this.context.payload.pull_request
    return pullRequestLabels.some(label => labels.includes(label.name))
  }

  getPullRequestNumber(): number {
    if (this.context.issue.number) {
      return this.context.issue.number
    }

    if (!this.context.payload.pull_request) {
      return 0
    }

    return this.context.payload.pull_request.number
  }
}
