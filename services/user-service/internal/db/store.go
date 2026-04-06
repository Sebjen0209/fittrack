package db

import "github.com/holmsted/fittrack/user-service/internal/types"

type UserStore interface {
	DoesUserExist(string) (bool, error)
	CreateUser(types.User) error
	GetUser(string) (types.User, error)
	UpdateUser(string, types.User) error
	DeleteUser(string) error
}
