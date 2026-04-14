import cron, { ScheduledTask } from 'node-cron'
import { store } from './config'
import { uploaderService } from './uploader'

export class SchedulerService {
  private task: ScheduledTask | null = null

  start() {
    const { schedule } = store.store
    this.stop()
    
    const cronExpression = this.mapConfigToCron(schedule)
    
    if (cron.validate(cronExpression)) {
      this.task = cron.schedule(cronExpression, () => {
        const { schedule } = store.store
        if (schedule.enabled) {
          console.log('[Scheduler] Running scheduled scan...')
          uploaderService.scanAndUpload()
        } else {
          console.log('[Scheduler] Scheduled scan skipped (disabled).')
        }
      })
      console.log(`[Scheduler] Started (${schedule.type}: ${schedule.value}) -> ${cronExpression}`)
    } else {
      console.error(`[Scheduler] Invalid cron produced: ${cronExpression}`)
    }
  }

  private mapConfigToCron(schedule: any): string {
    const { type, value } = schedule
    
    switch (type) {
      case 'interval': {
        const mins = parseInt(value)
        if (mins < 60) return `*/${mins} * * * *`
        const hours = Math.floor(mins / 60)
        return `0 */${hours} * * *`
      }
      case 'daily': {
        const [hour, minute] = value.split(':')
        return `${minute} ${hour} * * *`
      }
      case 'weekly': {
        const [day, time] = value.split('|')
        const [hour, minute] = time.split(':')
        return `${minute} ${hour} * * ${day}`
      }
      case 'monthly': {
        const [date, time] = value.split('|')
        const [hour, minute] = time.split(':')
        return `${minute} ${hour} ${date} * *`
      }
      case 'cron':
        return value
      default:
        return '*/30 * * * *'
    }
  }

  stop() {
    if (this.task) {
      this.task.stop()
      this.task = null
      console.log('[Scheduler] Stopped.')
    }
  }

  restart() {
    this.start()
  }
}

export const schedulerService = new SchedulerService()
