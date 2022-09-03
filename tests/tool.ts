import { expect, test } from '@jest/globals'
import { copyFile } from 'fs/promises'
import { bumpVersion } from '../src/tool'

test('tool_simple_1', async () => {
    await copyFile('tests/sample_cargo.toml', '/tmp/sample_cargo.toml')
    const res = await bumpVersion('/tmp/sample_cargo.toml', null, {
        major: true
    })
    expect(res.releaseName).toEqual('time-tz')
    expect(res.releaseVersion).toEqual('2.0.0')
})
