/* eslint-disable no-shadow */
declare module 'line-replace' {
    function lineReplace(
        file: string,
        line: number,
        text: string,
        addNewLine: boolean,
        callback: (
            file: string,
            line: number,
            text: string,
            replacedText: string,
            error: Error
        ) => void
    ): void
    export = lineReplace
}
