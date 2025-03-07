package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() error {
	dsn := "host=192.168.122.2 user=postgres password=postgresql dbname=gorm port=5432 sslmode=disable search_path=public"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return err
}

func GetDB() *gorm.DB {
	return DB
}
