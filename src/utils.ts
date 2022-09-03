/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable github/no-then */
import * as fs from 'fs'
import { parse } from 'semver'
import lineReplace from 'line-replace'
import { AsyncLineReader } from 'async-line-reader'
import { Version } from './version'

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
    await asyncLineReplace(path, project.versionLineId, project.version, false)
}

export function parseVersion(version: string): Version {
    const v = parse(version)
    if (!v) throw new EvalError('Could not parse semver version')
    const core = { minor: v.minor, major: v.major, patch: v.patch }
    if (v.prerelease.length === 0) return new Version(core, null, null)
    if (v.prerelease.length !== 4)
        throw new EvalError('Could not parse pre-release version information')
    let channel = v.prerelease[0].toString()
    const major = v.prerelease[1]
    const minor = v.prerelease[2]
    const patch = v.prerelease[3]
    if (channel.endsWith('-'))
        channel = channel.substring(0, channel.length - 1)
    if (
        typeof minor != 'number' ||
        typeof major != 'number' ||
        typeof patch != 'number'
    )
        throw new EvalError('Could not parse pre-release version information')
    const preRelease = { minor, major, patch }
    return new Version(core, channel, preRelease)
}
