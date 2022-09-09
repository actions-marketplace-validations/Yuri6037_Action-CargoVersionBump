import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { getOctokit, context } from '@actions/github'
// eslint-disable-next-line import/no-unresolved
import { IssueCommentEvent } from '@octokit/webhooks-definitions/schema'
import path from 'path'
import { get, set } from './tool'
import { getPullRequest, saveCargo } from './utils'

async function run(): Promise<void> {
    try {
        const mode = core.getInput('mode')
        const cargo = path.join(
            process.cwd(),
            core.getInput('cwd'),
            'Cargo.toml'
        )
        if (mode === 'get') {
            const res = await get(cargo)
            core.setOutput('name', res.name)
            core.setOutput('version', res.version)
            core.setOutput('is-new', res.isNew)
        } else if (mode === 'set') {
            const github = getOctokit(core.getInput('token'))
            const multi = core.getBooleanInput('multi')
            const branch = core.getInput('release-branch')
            const pr = await getPullRequest(github)
            if (branch) await exec('git', ['checkout', branch])
            const res = await set(cargo, multi)
            if (branch) await exec('git', ['checkout', pr.sourceBranch])
            const ctx = context.payload as IssueCommentEvent
            if (res.error) {
                await github.rest.issues.createComment({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    issue_number: pr.number,
                    body: `❌    ${res.error}`
                })
            }
            if (res.array && res.array.length > 0) {
                for (const item of res.array) {
                    await saveCargo(item.path, item.project)
                }
                await github.rest.reactions.createForIssueComment({
                    owner: context.actor,
                    repo: ctx.repository.name,
                    comment_id: res.comment_id,
                    content: 'rocket'
                })
            }
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
