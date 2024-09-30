import '@core/declarations'
import { Request, Response, NextFunction } from 'express'
import fs from 'node:fs'
import Mustache from 'mustache'

export const FileExistsSync = (FilePath) => {
  return fs.existsSync(`${FilePath}.js`) || fs.existsSync(`${FilePath}.ts`)
}


export function Wrap(controller: CallableFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next)
    } catch (error) {
      Logger.error(error)
      return res.internalServerError({ error })
    }
  }
}

export function GenerateCallableMessages(_Messages: any) {
  const Messages: { [key: string]: any } = {}

  function _GenerateCallableMessages(target: any, values: { [key: string]: any }) {
    try {
      for (const key in values) {
        if (typeof values[key] == 'string') {
          target[key] = (params: { [key: string]: string }) => {
            return Mustache.render(values[key], params)
          }
        } else {
          target[key] = {}
          _GenerateCallableMessages(target[key], values[key])
        }
      }
    } catch (error) {
      Logger.error(error)
    }
  }

  _GenerateCallableMessages(Messages, _Messages)
  return Messages
}

