package db

import "github.com/holmsted/fittrack/workout-service/internal/types"

type WorkoutStore interface {
	CreateWorkout(types.Workout) error
	GetWorkout(id string) (types.Workout, error)
	GetWorkoutsByUser(userID string) ([]types.Workout, error)
	DeleteWorkout(id string) error
}
