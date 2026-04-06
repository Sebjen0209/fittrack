package db

import (
	"fmt"

	"github.com/holmsted/fittrack/user-service/internal/types"
)

type MemoryStore struct {
	users map[string]types.User
}

// constructor
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		users: make(map[string]types.User),
	}
}

func (s *MemoryStore) DoesUserExist(id string) (bool, error) {
	_, exists := s.users[id]
	return exists, nil
}

func (s *MemoryStore) CreateUser(user types.User) error {
	s.users[user.ID] = user
	return nil
}

func (s *MemoryStore) GetUser(id string) (types.User, error) {
	user, exists := s.users[id]
	if !exists {
		return types.User{}, fmt.Errorf("User %s not found", id)
	}
	return user, nil
}

func (s *MemoryStore) UpdateUser(id string, user types.User) error {
	_, exists := s.users[id]
	if !exists {
		return fmt.Errorf("user %s not found", id)
	}
	s.users[id] = user
	return nil
}

func (s *MemoryStore) DeleteUser(id string) error {
	_, exists := s.users[id]
	if !exists {
		return fmt.Errorf("user %s not found", id)
	}
	delete(s.users, id)
	return nil
}
