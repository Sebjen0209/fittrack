package types

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// POST /api/users — ID og CreatedAt genereres af serveren,
type CreateUserRequest struct {
	Name  string `json:"name"  binding:"required"`
	Email string `json:"email" binding:"required"`
}

// PUT /api/users/:id — måske må man kun opdatere navn, ikke email
type UpdateUserRequest struct {
	Name string `json:"name" binding:"required"`
}
