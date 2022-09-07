import { Cargo, loadCargo, parseVersion } from './utils'
import { context } from '@actions/github'
import path from 'path'

export interface Project {
    version: string
    name: string
}

export interface VersionPatch {
    path: string
    project: Cargo
}

export interface Result {
    pr_id: number
    comment_id: number
    array?: VersionPatch[]
    error?: string
}

export async function get(path1: string): Promise<Project> {
    const project = await loadCargo(path1)
    return {
        name: project.name,
        version: project.version
    }
}

export async function patchVersion(
    path1: string,
    newVersion: string
): Promise<VersionPatch> {
    const project = await loadCargo(path1)
    const semver1 = parseVersion(project.version)
    const semver2 = parseVersion(newVersion)
    if (semver2.compare(semver1) !== 1) {
        throw new EvalError(
            `Version ${newVersion} is less or equal to ${project.version}`
        )
    }
    project.version = newVersion
    return { path: path1, project }
}

export async function set(path1: string, multi: boolean): Promise<Result> {
    const id = context.payload.pull_request?.number
    if (!id) throw new EvalError('No pull request found in the context')
    const comment = context.payload.comment
    if (!comment)
        throw new EvalError('No pull request comment found in the context')
    const body = comment.body as string
    const output: Result = {
        pr_id: id,
        comment_id: comment.id
    }
    if (multi) {
        const lines = body.split('\n')
        const res = []
        for (const line of lines) {
            const index = line.indexOf('/version')
            const lastIndex = line.lastIndexOf(' ')
            if (index !== -1 && lastIndex !== -1) {
                const newVersion = line.substring(lastIndex)
                const directory = line.substring(index + 9, lastIndex)
                try {
                    const vpatch = await patchVersion(
                        path.join(path1, directory),
                        newVersion
                    )
                    res.push(vpatch)
                } catch (error) {
                    if (error instanceof Error) output.error = error.message
                    else output.error = 'Unknown error'
                    return output
                }
            }
        }
        output.array = res
        return output
    } else {
        const index = body.indexOf('/version')
        if (index === -1) {
            output.array = []
            return output
        }
        const newVersion = body.substring(index + 9)
        try {
            const vpatch = await patchVersion(path1, newVersion)
            output.array = [vpatch]
            return output
        } catch (error) {
            if (error instanceof Error) output.error = error.message
            else output.error = 'Unknown error'
            return output
        }
    }
}
