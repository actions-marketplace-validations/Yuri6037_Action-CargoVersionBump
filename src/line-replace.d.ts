declare module 'line-replace' {
    //The doc on github is actualy broken, the lib uses a table!
    interface Params {
        file: string
        line: number
        text: string
        addNewLine: boolean
        callback: (
            file: string,
            line: number,
            text: string,
            replacedText: string,
            error: Error
        ) => void
    }

    function lineReplace(params: Params): void
    export = lineReplace
}
