package dockeractions

type CreateContainerData struct {
	Action           string `json:"action"`
	UserDataId       string `json:"userDataId"`
	SshPublicKey     string `json:"sshPublicKey"`
	ContainerName    string `json:"containerName"`
	DockerHostName   string `json:"DockerHostName"`
	ContainerImage   string `json:"containerImage"`
	ContainerTag     string `json:"containerTag"`
	ContainerNetwork string `json:"containerNetwork"`
	SshProxyPort     string `json:"sshProxyPort"`
	SshProxyNode     string `json:"sshProxyNode"`
}
