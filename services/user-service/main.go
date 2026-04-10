package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/holmsted/fittrack/user-service/internal/api"
	"github.com/holmsted/fittrack/user-service/internal/db"
)

func main() {
	connectionString := "postgres://fittrack:fittrack@postgres-users:5432/users?sslmode=disable"
	store, err := db.NewPostgresStore(connectionString)

	if err != nil {
		log.Fatal(err)
	}

	handler := api.NewApiHandler(store)
	r := gin.Default()
	handler.RegisterRoutes(r)

	r.Run(":8080")
}
