package database

import (
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	once sync.Once
	DB   *gorm.DB
)

func GetDB() *gorm.DB {
	once.Do(func() {
		var err error
		dsn := "host=192.168.122.2 user=postgres password=postgresql dbname=caas port=5432 sslmode=disable"
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			panic("failed to connect database")
		}
	})
	return DB
}
