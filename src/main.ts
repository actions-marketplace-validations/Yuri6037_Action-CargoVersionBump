import * as core from '@actions/core'
import path from 'path'
import { exists, loadCargo } from './utils'
//import {wait} from './wait'

async function run(): Promise<void> {
    try {
        const major = core.getBooleanInput('major')
        const minor = core.getBooleanInput('minor')
        const patch = core.getBooleanInput('patch')
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
        const project = loadCargo(cargo)
        if (major) {
            core.debug('Bumping major version...')
        }
        if (minor) {
            core.debug('Bumping minor version...')
        }
        if (patch) {
            core.debug('Bumping patch version...')
        }
        //core.debug(new Date().toTimeString())
        //await wait(parseInt(ms, 10))
        //core.debug(new Date().toTimeString())

        core.setOutput('time', new Date().toTimeString())
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
