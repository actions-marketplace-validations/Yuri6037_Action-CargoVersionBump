import { loadCargo, parseVersion, saveCargo } from './utils'

export interface VersionBumpsResult {
    releaseName: string
    releaseVersion: string
}

export interface VersionBumps {
    major?: boolean
    minor?: boolean
    patch?: boolean
}

export async function bumpVersion(
    path: string,
    channel: string | null,
    bumps: VersionBumps
): Promise<VersionBumpsResult> {
    const project = await loadCargo(path)
    const version = parseVersion(project.version)
    version.jumpChannel(channel)
    if (bumps.major) version.bumpMajor()
    if (bumps.minor) version.bumpMinor()
    if (bumps.patch) version.bumpPatch()
    const updatedVersion = version.format()
    project.version = updatedVersion
    saveCargo(path, project)
    return {
        releaseName: project.name,
        releaseVersion: updatedVersion
    }
}
