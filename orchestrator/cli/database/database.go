package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() error {
	// TODO: get the db details from env
	dsn := "host=192.168.122.2 user=postgres password=postgresql dbname=gorm port=5432 sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return err
}

func GetDB() *gorm.DB {
	return DB
}
