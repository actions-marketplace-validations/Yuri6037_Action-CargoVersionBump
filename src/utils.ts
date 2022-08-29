/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable github/no-then */
import * as fs from 'fs'
import { parse } from 'semver'
import * as toml from 'toml'

export interface Cargo {
    name: string
    version: string
}

export function exists(path: string): Promise<boolean> {
    return fs.promises
        .access(path, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false)
}

export async function loadCargo(path: string): Promise<Cargo> {
    const text = await fs.promises.readFile(path, 'utf8')
    return toml.parse(text)
}

interface VersionNumber {
    minor: number
    major: number
    patch: number
}

export class Version {
    private core: VersionNumber
    private channel: string | null
    private preRelease: VersionNumber | null

    constructor(
        core: VersionNumber,
        channel: string | null,
        preRelease: VersionNumber | null
    ) {
        this.core = core
        this.channel = channel
        this.preRelease = preRelease
    }

    jumpChannel(channel: string) {
        if (this.channel) {
            this.channel = channel
        } else {
            this.channel = channel
            this.preRelease = null
        }
    }

    bumpMinor() {
        if (this.channel) {
            if (this.preRelease) {
                this.preRelease.minor += 1
            } else {
                this.core.minor += 1
                this.preRelease = { minor: 1, major: 0, patch: 0 }
            }
        } else {
            this.core.minor += 1
        }
    }

    bumpMajor() {
        if (this.channel) {
            if (this.preRelease) {
                this.preRelease.major += 1
            } else {
                this.core.major += 1
                this.preRelease = { minor: 0, major: 1, patch: 0 }
            }
        } else {
            this.core.major += 1
        }
    }

    bumpPatch() {
        if (this.channel) {
            if (this.preRelease) {
                this.preRelease.patch += 1
            } else {
                this.core.patch += 1
                this.preRelease = { minor: 0, major: 0, patch: 1 }
            }
        } else {
            this.core.patch += 1
        }
    }

    format(): string {
        if (this.channel) {
            return `${this.core.major}.${this.core.minor}.${this.core.patch}-${this.channel}-${this.preRelease?.major}.${this.preRelease?.minor}.${this.preRelease?.patch}`
        } else {
            return `${this.core.major}.${this.core.minor}.${this.core.patch}`
        }
    }
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
