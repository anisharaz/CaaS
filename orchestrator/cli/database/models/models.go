package models

import "time"

type Available_ssh_proxy_ports struct {
	ID                  string `gorm:"primaryKey;column:id"`
	Ssh_proxy_node_name string `gorm:"column:ssh_proxy_node_name"`
	Ssh_proxy_port      int32  `gorm:"column:ssh_proxy_port"`
	Used                bool   `gorm:"column:used"`
}

func (Available_ssh_proxy_ports) TableName() string {
	return "public.available_ssh_proxy_ports"
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
	return "public.ssh_config"
}

type Containers struct {
	Name             string    `gorm:"primaryKey;column:id"`
	Nick_name        string    `gorm:"column:nick_name"`
	NodeId           string    `gorm:"column:nodeId"`
	Image            string    `gorm:"column:image"`
	Tag              string    `gorm:"column:tag"`
	State            string    `gorm:"column:state"`
	CreatedAt        time.Time `gorm:"column:createdAt;default:CURRENT_TIMESTAMP"`
	UpdatedAt        time.Time `gorm:"column:updatedAt;autoUpdateTime"`
	VpcId            string    `gorm:"column:vpcId"`
	Ip_address       string    `gorm:"column:ip_address"`
	UserDataId       string    `gorm:"column:UserDataId"`
	Ssh_config_id    string    `gorm:"column:ssh_config_id;unique"`
	Ssh_keysId       string    `gorm:"column:ssh_keysId"`
	Provision_status string    `gorm:"column:provision_status"`
}

func (Containers) TableName() string {
	return "public.containers"
}

type Containers_scheduled struct {
	ID             string `gorm:"primaryKey;column:id"`
	UserDataId     string `gorm:"column:UserDataId"`
	Ssh_keysId     string `gorm:"column:ssh_keysId"`
	Container_name string `gorm:"column:container_name"`
	NodeId         string `gorm:"column:nodeId"`
	Image          string `gorm:"column:image"`
	Tag            string `gorm:"column:tag"`
	Network        string `gorm:"column:network"`
	Storage        string `gorm:"column:storage"`
}

func (Containers_scheduled) TableName() string {
	return "public.containers_scheduled"
}

// * Ssh_keys struct is not the complete schema of
// * the table, only required fields are added
type Ssh_keys struct {
	ID        string `gorm:"primaryKey;column:id"`
	PublicKey string `gorm:"column:public_key"`
}

func (Ssh_keys) TableName() string {
	return "public.ssh_keys"
}

// * Nodes struct is not the complete schema of
// * the table, only required fields are added
type Nodes struct {
	ID        string `gorm:"primaryKey;column:id"`
	Node_name string `gorm:"column:node_name"`
}

func (Nodes) TableName() string {
	return "nodes.nodes"
}
