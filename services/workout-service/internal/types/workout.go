package types

import "time"

type Set struct {
	ID         string  `json:"id"`
	ExerciseID string  `json:"exercise_id"`
	Reps       int     `json:"reps"`
	Weight     float64 `json:"weight"` // kg
}

type Exercise struct {
	ID        string `json:"id"`
	WorkoutID string `json:"workout_id"`
	Name      string `json:"name"`
	Sets      []Set  `json:"sets"`
}

type Workout struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	Exercises []Exercise `json:"exercises"`
}

// Request types
type CreateSetRequest struct {
	Reps   int     `json:"reps"   binding:"required"`
	Weight float64 `json:"weight" binding:"required"`
}

type CreateExerciseRequest struct {
	Name string             `json:"name" binding:"required"`
	Sets []CreateSetRequest `json:"sets" binding:"required"`
}

type CreateWorkoutRequest struct {
	UserID    string                 `json:"user_id"   binding:"required"`
	Name      string                 `json:"name"      binding:"required"`
	Exercises []CreateExerciseRequest `json:"exercises" binding:"required"`
}
