package db

import (
	"database/sql"
	"fmt"

	"github.com/holmsted/fittrack/user-service/internal/types"
	_ "github.com/lib/pq"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("kunne ikke åbne database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("kunne ikke forbinde til database: %w", err)
	}

	store := &PostgresStore{db: db}

	if err := store.createTable(); err != nil {
		return nil, fmt.Errorf("kunne ikke oprette tabel: %w", err)
	}

	return store, nil
}

func (s *PostgresStore) createTable() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id         TEXT PRIMARY KEY,
			name       TEXT NOT NULL,
			email      TEXT NOT NULL UNIQUE,
			created_at TIMESTAMP DEFAULT NOW()
		)
	`)
	return err
}

func (s *PostgresStore) DoesUserExist(id string) (bool, error) {
	var exists bool
	err := s.db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, id,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("kunne ikke tjekke bruger: %w", err)
	}
	return exists, nil
}

func (s *PostgresStore) CreateUser(user types.User) error {
	_, err := s.db.Exec(
		`INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, $4)`,
		user.ID, user.Name, user.Email, user.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("kunne ikke oprette bruger: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetUser(id string) (types.User, error) {
	var user types.User
	err := s.db.QueryRow(
		`SELECT id, name, email, created_at FROM users WHERE id = $1`, id,
	).Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
	if err == sql.ErrNoRows {
		return types.User{}, fmt.Errorf("bruger %s ikke fundet", id)
	}
	if err != nil {
		return types.User{}, fmt.Errorf("kunne ikke hente bruger: %w", err)
	}
	return user, nil
}

func (s *PostgresStore) UpdateUser(id string, user types.User) error {
	result, err := s.db.Exec(
		`UPDATE users SET name = $2, email = $3 WHERE id = $1`,
		id, user.Name, user.Email,
	)
	if err != nil {
		return fmt.Errorf("kunne ikke opdatere bruger: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("kunne ikke tjekke opdatering: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("bruger %s ikke fundet", id)
	}
	return nil
}

func (s *PostgresStore) DeleteUser(id string) error {
	result, err := s.db.Exec(
		`DELETE FROM users WHERE id = $1`, id,
	)
	if err != nil {
		return fmt.Errorf("kunne ikke slette bruger: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("kunne ikke tjekke sletning: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("bruger %s ikke fundet", id)
	}
	return nil
}
