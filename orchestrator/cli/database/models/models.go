package models

import "time"

type Available_ssh_proxy_ports struct {
	ID                  string `gorm:"primaryKey;column:id"`
	Ssh_proxy_node_name string `gorm:"column:ssh_proxy_node_name"`
	Ssh_proxy_port      int32  `gorm:"column:ssh_proxy_port"`
	Used                bool   `gorm:"column:used"`
}

func (Available_ssh_proxy_ports) TableName() string {
	return "available_ssh_proxy_ports"
}

type Ssh_config struct {
	ID                          string    `gorm:"primaryKey;column:id"`
	Ssh_proxy_node_name         string    `gorm:"column:ssh_proxy_node_name"`
	Ssh_proxy_port              uint32    `gorm:"column:ssh_proxy_port"`
	Ssh_tunnel_process_id       uint32    `gorm:"column:ssh_tunnel_process_id"`
	UpdatedAt                   time.Time `gorm:"column:updatedAt"`
	UserDataId                  string    `gorm:"column:UserDataId"`
	Available_ssh_proxy_portsId string    `gorm:"column:available_ssh_proxy_portsId"`
}

func (Ssh_config) TableName() string {
	return "ssh_config"
}

// TODO: complete the struct and add other struct of tables required by the relations of this table
type Containers struct {
	Name             string `gorm:"primaryKey;column:id"`
	Provision_status string `gorm:"column:provision_status"`
}

func (Containers) TableName() string {
	return "containers"
}
