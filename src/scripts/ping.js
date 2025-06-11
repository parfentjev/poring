export const config = {
  type: 'eventHandler',
  event: 'PING'
}

export const eventHandler = (context) => {
  context.send(`PONG :${context.message.text.value}`)
}
