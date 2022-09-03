interface VersionNumber {
    minor: number
    major: number
    patch: number
}

export class Version {
    private core: VersionNumber
    private channel: string | null
    private preRelease: VersionNumber | null
    private lock: boolean

    constructor(
        core: VersionNumber,
        channel: string | null,
        preRelease: VersionNumber | null
    ) {
        this.core = core
        this.channel = channel
        this.preRelease = preRelease
        this.lock = false
    }

    jumpChannel(channel: string | null) {
        if (this.channel) {
            if (channel) {
                this.channel = channel
            } else {
                this.channel = null
                this.preRelease = null
                this.lock = true
            }
        } else {
            this.channel = channel
            this.preRelease = null
        }
    }

    bumpMinor() {
        if (this.channel) {
            if (this.preRelease) {
                this.preRelease.patch = 0
                this.preRelease.minor += 1
            } else {
                this.core.minor += 1
                this.preRelease = { minor: 1, major: 0, patch: 0 }
            }
        } else if (!this.lock) {
            this.core.patch = 0
            this.core.minor += 1
        }
    }

    bumpMajor() {
        if (this.channel) {
            if (this.preRelease) {
                this.preRelease.minor = 0
                this.preRelease.patch = 0
                this.preRelease.major += 1
            } else {
                this.core.major += 1
                this.preRelease = { minor: 0, major: 1, patch: 0 }
            }
        } else if (!this.lock) {
            this.core.minor = 0
            this.core.patch = 0
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
        } else if (!this.lock) {
            this.core.patch += 1
        }
    }

    format(): string {
        if (this.channel) {
            return `${this.core.major}.${this.core.minor}.${this.core.patch}-${this.channel}.${this.preRelease?.major}.${this.preRelease?.minor}.${this.preRelease?.patch}`
        } else {
            return `${this.core.major}.${this.core.minor}.${this.core.patch}`
        }
    }
}
