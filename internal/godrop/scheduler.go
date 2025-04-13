package godrop

import (
	"log"
)

func (g *GoDrop) Schedule(cronExpression string, handler ScheduleHandler) {
	if _, err := g.cron.AddFunc(cronExpression, func() {
		handler(&ScheduleContext{g.send, g.sendf, g.config})
	}); err != nil {
		log.Printf("Failed to schedule: %v", err)
	}
}
