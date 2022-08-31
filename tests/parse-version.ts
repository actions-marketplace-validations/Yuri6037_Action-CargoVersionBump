import { parseVersion } from '../src/utils'
import { expect, test } from '@jest/globals'

test('parseVersion_simple_1', async () => {
    const version = parseVersion('1.0.0')
    version.bumpMajor()
    version.bumpMinor()
    version.bumpPatch()
    expect(version.format()).toEqual('2.1.1')
})

test('parseVersion_pre_major', async () => {
    const version = parseVersion('1.0.0-pre.0.0.1')
    version.jumpChannel('pre')
    version.bumpMajor()
    expect(version.format()).toEqual('1.0.0-pre.1.0.1')
})

test('parseVersion_pre_minor', async () => {
    const version = parseVersion('1.0.0-pre.0.0.1')
    version.jumpChannel('pre')
    version.bumpMinor()
    expect(version.format()).toEqual('1.0.0-pre.0.1.1')
})

test('parseVersion_pre_patch', async () => {
    const version = parseVersion('1.0.0-pre.0.0.1')
    version.jumpChannel('pre')
    version.bumpPatch()
    expect(version.format()).toEqual('1.0.0-pre.0.0.2')
})

test('parseVersion_jump_pre_major', async () => {
    const version = parseVersion('1.0.0')
    version.jumpChannel('pre')
    version.bumpMajor()
    expect(version.format()).toEqual('2.0.0-pre.1.0.0')
})

test('parseVersion_jump_pre_minor', async () => {
    const version = parseVersion('1.0.0')
    version.jumpChannel('pre')
    version.bumpMinor()
    expect(version.format()).toEqual('1.1.0-pre.0.1.0')
})

test('parseVersion_jump_pre_patch', async () => {
    const version = parseVersion('1.0.0')
    version.jumpChannel('pre')
    version.bumpPatch()
    expect(version.format()).toEqual('1.0.1-pre.0.0.1')
})

test('parseVersion_jump_major', async () => {
    const version = parseVersion('2.0.0-pre.1.0.0')
    version.jumpChannel(null)
    version.bumpMajor()
    expect(version.format()).toEqual('2.0.0')
})

test('parseVersion_jump_minor', async () => {
    const version = parseVersion('1.1.0-pre.0.1.0')
    version.jumpChannel(null)
    version.bumpMinor()
    expect(version.format()).toEqual('1.1.0')
})

test('parseVersion_jump_patch', async () => {
    const version = parseVersion('1.0.1-pre.0.0.1')
    version.jumpChannel(null)
    version.bumpPatch()
    expect(version.format()).toEqual('1.0.1')
})
