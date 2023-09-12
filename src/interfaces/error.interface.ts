export interface IErrorObject extends Error
{
    data?: []
    code?: number
    message: string
}