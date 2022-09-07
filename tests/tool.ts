import { expect, test } from '@jest/globals'
import { get } from '../src/tool'

test('tool_simple_get', async () => {
    const res = await get('tests/sample_cargo.toml')
    expect(res.name).toEqual('time-tz')
    expect(res.version).toEqual('1.0.2')
})
