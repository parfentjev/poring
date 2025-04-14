package godrop

import (
	"log"
	"math/rand"
	"time"
)

func (g *GoDrop) CronSchedule(cronExpression string, handler ScheduleHandler) {
	if _, err := g.cron.AddFunc(cronExpression, func() {
		handler(&ScheduleContext{g.send, g.sendf, g.config})
	}); err != nil {
		log.Printf("Failed to schedule: %v", err)
	}
}

func (g *GoDrop) TimerSchedule(timerRangeStart int, timerRangeEnd int, handler ScheduleHandler) {
	go func() {
		for {
			minDuration := time.Duration(timerRangeStart) * time.Minute
			maxDuration := time.Duration(timerRangeEnd) * time.Minute
			randomDuration := minDuration + time.Duration(rand.Int63n(int64(maxDuration-minDuration)))
			time.Sleep(randomDuration)

			handler(&ScheduleContext{g.send, g.sendf, g.config})
		}
	}()
}
