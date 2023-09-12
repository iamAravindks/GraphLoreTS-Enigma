/* eslint-disable @typescript-eslint/no-explicit-any */


export class ErrorObject extends Error
{
    code: number
    data: any[]
    constructor(message: string, code: number = 500, data: any = [])
    {
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.data = data
    }

}