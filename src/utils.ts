/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable github/no-then */
import * as fs from 'fs'
import { parse, SemVer } from 'semver'
import lineReplace from 'line-replace'
import { AsyncLineReader } from 'async-line-reader'
import axios from 'axios'
// eslint-disable-next-line import/no-unresolved
import { IssueCommentEvent } from '@octokit/webhooks-types'
import { context } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

function asyncLineReplace(
    file: string,
    line: number,
    text: string,
    addNewLine: boolean
): Promise<{ file: string; line: number; text: string; replacedText: string }> {
    return new Promise((resolve, reject) => {
        lineReplace({
            file,
            line,
            text,
            addNewLine,
            //It's impossible to do any other way arround due to the poor broken architecture of the lib!
            // eslint-disable-next-line object-shorthand
            callback: function (par0, par1, par2, par3, par4) {
                //stupid shallow rule thing forces naming with 'parN'
                if (par4) {
                    reject(par4)
                } else {
                    resolve({
                        file: par0,
                        line: par1,
                        text: par2,
                        replacedText: par3
                    })
                }
            }
        })
    })
}

export interface Cargo {
    name: string
    version: string
    versionLineId: number
}

export function exists(path: string): Promise<boolean> {
    return fs.promises
        .access(path, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false)
}

export async function loadCargo(path: string): Promise<Cargo> {
    const result = {
        name: '',
        version: '',
        versionLineId: 0
    }
    const stream = fs.createReadStream(path, 'utf8')
    const reader = new AsyncLineReader(stream)
    const nameRegex = /name = "(.+)"/
    const versionRegex = /version = "([0-9]+.[0-9]+.[0-9]+(-.+)?)"/
    let line
    let lineId = 0
    while ((line = await reader.readLine())) {
        lineId += 1
        const name = line.match(nameRegex)
        const version = line.match(versionRegex)
        if (name) result.name = name[1]
        if (version) {
            result.version = version[1]
            result.versionLineId = lineId
        }
        //If all inormation was retrieved stop to avoid further iterations
        if (result.name && result.version) break
    }
    return result
}

export async function saveCargo(path: string, project: Cargo): Promise<void> {
    await asyncLineReplace(
        path,
        project.versionLineId,
        `version = "${project.version}"\n`,
        false
    )
}

export function parseVersion(version: string): SemVer {
    const v = parse(version)
    if (!v) throw new EvalError('Could not parse semver version')
    return v
}

interface CratesIo {
    versions: { num: string; yanked: boolean }[]
}

export async function getLatestCratesIoVersion(
    name: string
): Promise<string | null> {
    try {
        const response = await axios.get<CratesIo>(
            `https://crates.io/${name}/versions`
        )
        const versions = response.data.versions.filter(v => !v.yanked)
        if (versions.length > 0) {
            return versions[0].num
        }
        return null
    } catch (_) {
        return null
    }
}

export interface PullRequest {
    targetBranch: string
    sourceBranch: string
    number: number
    commits: number
}

export async function getPullRequest(
    kit: InstanceType<typeof GitHub>
): Promise<PullRequest> {
    const ctx = context.payload as IssueCommentEvent
    const id = ctx.issue.number
    const pr = await kit.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: id
    })
    if (pr.status !== 200)
        throw new EvalError('The context is not associated to a Pull Request')
    return {
        targetBranch: pr.data.base.ref,
        sourceBranch: pr.data.head.ref,
        number: pr.data.number,
        commits: pr.data.commits
    }
}
