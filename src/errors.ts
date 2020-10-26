import type { Response } from 'node-fetch'

export class YeahdeskError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    /* istanbul ignore else  */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class YeahdeskRequestError extends YeahdeskError {
  public url?: string
  public status?: number
  public statusText?: string

  constructor(message: string, response?: Response) {
    super(message)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

export class YeahdeskApiError extends YeahdeskRequestError {
  constructor(message: string, response?: Response) {
    super(message)

    if (response) {
      this.url = response.url
      this.status = response.status
      this.statusText = response.statusText
    }
  }
}

export class YeahdeskNotFoundError extends YeahdeskApiError {
  constructor(message: string, response?: Response) {
    super(message, response)
  }
}
