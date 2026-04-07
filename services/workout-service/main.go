package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/holmsted/fittrack/workout-service/internal/api"
	"github.com/holmsted/fittrack/workout-service/internal/db"
)

func main() {
	connStr := "postgres://fittrack:fittrack@localhost:5433/workouts?sslmode=disable"
	store, err := db.NewPostgresStore(connStr)
	if err != nil {
		log.Fatal(err)
	}

	handler := api.NewApiHandler(store)
	r := gin.Default()
	handler.RegisterRoutes(r)

	r.Run(":8081") // port 8081 to avoid collision with user-service
}
