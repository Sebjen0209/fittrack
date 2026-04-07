package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/holmsted/fittrack/workout-service/internal/db"
	"github.com/holmsted/fittrack/workout-service/internal/types"
)

type ApiHandler struct {
	dbStore db.WorkoutStore
}

func NewApiHandler(dbStore db.WorkoutStore) *ApiHandler {
	return &ApiHandler{dbStore: dbStore}
}

func (h *ApiHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/workouts", h.CreateWorkout)
		api.GET("/workouts/:id", h.GetWorkout)
		api.GET("/workouts/user/:user_id", h.GetWorkoutsByUser)
		api.DELETE("/workouts/:id", h.DeleteWorkout)
	}
}

func (h *ApiHandler) CreateWorkout(c *gin.Context) {
	var req types.CreateWorkoutRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workout := types.Workout{
		ID:        uuid.New().String(),
		UserID:    req.UserID,
		Name:      req.Name,
		CreatedAt: time.Now(),
	}

	for _, exReq := range req.Exercises {
		exercise := types.Exercise{
			ID:   uuid.New().String(),
			Name: exReq.Name,
		}
		for _, setReq := range exReq.Sets {
			exercise.Sets = append(exercise.Sets, types.Set{
				ID:     uuid.New().String(),
				Reps:   setReq.Reps,
				Weight: setReq.Weight,
			})
		}
		workout.Exercises = append(workout.Exercises, exercise)
	}

	if err := h.dbStore.CreateWorkout(workout); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, workout)
}

func (h *ApiHandler) GetWorkout(c *gin.Context) {
	id := c.Param("id")
	workout, err := h.dbStore.GetWorkout(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workout)
}

func (h *ApiHandler) GetWorkoutsByUser(c *gin.Context) {
	userID := c.Param("user_id")
	workouts, err := h.dbStore.GetWorkoutsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workouts)
}

func (h *ApiHandler) DeleteWorkout(c *gin.Context) {
	id := c.Param("id")
	if err := h.dbStore.DeleteWorkout(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "workout deleted"})
}
