import { expect, test } from '@jest/globals'
import { loadCargo } from '../src/utils'

test('load_cargo_simple_1', async () => {
    const project = await loadCargo('./tests/sample_cargo.toml')
    expect(project.name).toEqual('time-tz')
    expect(project.version).toEqual('1.0.2')
    expect(project.versionLineId).toEqual(3)
})
