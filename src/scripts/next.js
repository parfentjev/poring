export const config = {
  type: 'cronJob',
  cron: {
    expression: '*/10 * * * *'
  }
}

const channel = '#prontera_field'

export const scheduleHandler = (context) => {
  context.send(`PRIVMSG ${channel} :!n`)
}
