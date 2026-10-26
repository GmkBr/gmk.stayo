export class DemoHttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'DemoHttpError'
    this.status = status
  }
}
