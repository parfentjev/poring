export const event = 'PING'

export const handler = (context) => {
  context.send(`PONG :${context.message.text.value}`)
}
