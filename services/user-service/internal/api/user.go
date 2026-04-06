package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/holmsted/fittrack/user-service/internal/db"
	"github.com/holmsted/fittrack/user-service/internal/types"
)

type ApiHandler struct {
	dbStore db.UserStore
}

func NewApiHandler(dbStore db.UserStore) *ApiHandler {
	return &ApiHandler{
		dbStore: dbStore,
	}
}

func (h *ApiHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/users/:id", h.GetUser)
		api.POST("/users", h.CreateUser)
		api.PUT("/users/:id", h.UpdateUser)
		api.DELETE("/users/:id", h.DeleteUser)
	}
}

func (h *ApiHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	user, err := h.dbStore.GetUser(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *ApiHandler) CreateUser(c *gin.Context) {
	var user types.User

	err := c.ShouldBindBodyWithJSON(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//checks if the user already exist
	exists, _ := h.dbStore.DoesUserExist(user.ID)
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "user already exisist"})
		return
	}

	err = h.dbStore.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)

}

func (h *ApiHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user types.User

	err := c.ShouldBindBodyWithJSON(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.dbStore.UpdateUser(id, user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, user)
}

func (h *ApiHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := h.dbStore.DeleteUser(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
