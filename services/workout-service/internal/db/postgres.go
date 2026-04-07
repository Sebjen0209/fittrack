package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/holmsted/fittrack/workout-service/internal/types"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	store := &PostgresStore{db: db}
	if err := store.createTables(); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}
	return store, nil
}

func (s *PostgresStore) createTables() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS workouts (
			id         TEXT PRIMARY KEY,
			user_id    TEXT NOT NULL,
			name       TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS exercises (
			id         TEXT PRIMARY KEY,
			workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
			name       TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS sets (
			id          TEXT PRIMARY KEY,
			exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
			reps        INT NOT NULL,
			weight      FLOAT NOT NULL
		);
	`)
	return err
}

func (s *PostgresStore) CreateWorkout(w types.Workout) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`INSERT INTO workouts (id, user_id, name, created_at) VALUES ($1, $2, $3, $4)`,
		w.ID, w.UserID, w.Name, w.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create workout: %w", err)
	}

	for _, ex := range w.Exercises {
		_, err = tx.Exec(
			`INSERT INTO exercises (id, workout_id, name) VALUES ($1, $2, $3)`,
			ex.ID, w.ID, ex.Name,
		)
		if err != nil {
			return fmt.Errorf("failed to create exercise: %w", err)
		}

		for _, set := range ex.Sets {
			_, err = tx.Exec(
				`INSERT INTO sets (id, exercise_id, reps, weight) VALUES ($1, $2, $3, $4)`,
				set.ID, ex.ID, set.Reps, set.Weight,
			)
			if err != nil {
				return fmt.Errorf("failed to create set: %w", err)
			}
		}
	}

	return tx.Commit()
}

func (s *PostgresStore) GetWorkout(id string) (types.Workout, error) {
	var w types.Workout
	err := s.db.QueryRow(
		`SELECT id, user_id, name, created_at FROM workouts WHERE id = $1`, id,
	).Scan(&w.ID, &w.UserID, &w.Name, &w.CreatedAt)
	if err == sql.ErrNoRows {
		return types.Workout{}, fmt.Errorf("workout %s not found", id)
	}
	if err != nil {
		return types.Workout{}, fmt.Errorf("failed to get workout: %w", err)
	}

	w.Exercises, err = s.getExercises(w.ID)
	if err != nil {
		return types.Workout{}, err
	}

	return w, nil
}

func (s *PostgresStore) GetWorkoutsByUser(userID string) ([]types.Workout, error) {
	rows, err := s.db.Query(
		`SELECT id, user_id, name, created_at FROM workouts WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get workouts: %w", err)
	}
	defer rows.Close()

	var workouts []types.Workout
	for rows.Next() {
		var w types.Workout
		if err := rows.Scan(&w.ID, &w.UserID, &w.Name, &w.CreatedAt); err != nil {
			return nil, err
		}
		w.Exercises, err = s.getExercises(w.ID)
		if err != nil {
			return nil, err
		}
		workouts = append(workouts, w)
	}
	return workouts, nil
}

func (s *PostgresStore) DeleteWorkout(id string) error {
	result, err := s.db.Exec(`DELETE FROM workouts WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete workout: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("workout %s not found", id)
	}
	return nil
}

func (s *PostgresStore) getExercises(workoutID string) ([]types.Exercise, error) {
	rows, err := s.db.Query(
		`SELECT id, workout_id, name FROM exercises WHERE workout_id = $1`, workoutID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get exercises: %w", err)
	}
	defer rows.Close()

	var exercises []types.Exercise
	for rows.Next() {
		var ex types.Exercise
		if err := rows.Scan(&ex.ID, &ex.WorkoutID, &ex.Name); err != nil {
			return nil, err
		}
		ex.Sets, err = s.getSets(ex.ID)
		if err != nil {
			return nil, err
		}
		exercises = append(exercises, ex)
	}
	return exercises, nil
}

func (s *PostgresStore) getSets(exerciseID string) ([]types.Set, error) {
	rows, err := s.db.Query(
		`SELECT id, exercise_id, reps, weight FROM sets WHERE exercise_id = $1`, exerciseID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get sets: %w", err)
	}
	defer rows.Close()

	var sets []types.Set
	for rows.Next() {
		var s types.Set
		if err := rows.Scan(&s.ID, &s.ExerciseID, &s.Reps, &s.Weight); err != nil {
			return nil, err
		}
		sets = append(sets, s)
	}
	return sets, nil
}
