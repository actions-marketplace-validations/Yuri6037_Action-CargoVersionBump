import * as core from '@actions/core'
import path from 'path'
import { bumpVersion } from './tool'
import { exists } from './utils'

async function run(): Promise<void> {
    try {
        const major = core.getBooleanInput('major')
        const minor = core.getBooleanInput('minor')
        const patch = core.getBooleanInput('patch')
        const channel = core.getInput('pre-release-channel')
        const cargo = path.join(
            process.cwd(),
            core.getInput('cwd'),
            'Cargo.toml'
        )
        core.debug(`Using project directory '${cargo}'.`)
        if (!(await exists(cargo))) {
            core.setFailed(
                'No Cargo.toml found in the specified project directory'
            )
        }
        const res = await bumpVersion(cargo, channel, { major, minor, patch })
        core.setOutput('release-name', res.releaseName)
        core.setOutput('release-version', res.releaseVersion)
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
