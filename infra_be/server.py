from InfrastructureFunctions import (
    CreateContainer,
    DeleteContainer,
    CreateDockerNetwork,
    DeleteDockerNetwork,
    CreateNginxConfig,
    DeleteNginxConfig,
    ActionsContainer,
    CreateSSHTunnel,
    CreateSSHAuthorizedKeysFile,
    DeleteSSHTunnel,
    InitUser,
    DeleteSSHAuthorizedKeysFile,
    EditNginxConfig,
)
from sshkey_tools.keys import (
    RsaPrivateKey,
)
from type import (
    ContainerData,
    DockerNetworkData,
    CreateNginxConfigData,
    DeleteNginxConfigData,
    ContainerReturnData,
    CreateNginxConfigReturnData,
    DeleteNginxConfigReturnData,
    DockerNetworkReturnData,
    ContainerActions,
    ContainerActionsReturnData,
    AuthorizedKeysData,
    AuthorizedKeysReturnData,
    CreateSSHTunnelData,
    CreateSSHTunnelReturnData,
    DeleteSSHTunnelData,
    DeleteSSHTunnelReturnData,
    DeleteAuthorizedKeysData,
    DeleteAuthorizedKeysReturnData,
    InitUserData,
    InitUserReturnData,
    SSHKeyGenReturnData,
    DeleteContainerData,
    DeleteContainerReturnData,
    EditNginxConfigData,
    EditNginxConfigReturnData,
    DockerNetworkDeleteData,
    DockerNetworkDeleteReturnData,
)


from fastapi import FastAPI

app = FastAPI()


@app.post("/container")
async def create_container(container: ContainerData) -> ContainerReturnData:
    return await CreateContainer(container)


@app.post("/container_actions")
async def ContainerActions(data: ContainerActions) -> ContainerActionsReturnData:
    return await ActionsContainer(data)


@app.delete("/container")
async def delete_container(container: DeleteContainerData) -> DeleteContainerReturnData:
    return await DeleteContainer(container)


@app.post("/network")
async def create_network(network: DockerNetworkData) -> DockerNetworkReturnData:
    return await CreateDockerNetwork(network)


@app.delete("/network")
async def delete_network(
    network: DockerNetworkDeleteData,
) -> DockerNetworkDeleteReturnData:
    return await DeleteDockerNetwork(network)


@app.post("/nginx")
async def create_nginx_config(
    nginx: CreateNginxConfigData,
) -> CreateNginxConfigReturnData:
    return await CreateNginxConfig(nginx)


@app.delete("/nginx")
async def delete_nginx_config(
    nginx: DeleteNginxConfigData,
) -> DeleteNginxConfigReturnData:
    return await DeleteNginxConfig(nginx)


@app.post("/edit_nginx")
async def edit_nginx_config(
    nginx: EditNginxConfigData,
) -> EditNginxConfigReturnData:
    return await EditNginxConfig(nginx)


@app.post("/sshtunnel")
async def create_sshtunnel(sshtunnel: CreateSSHTunnelData) -> CreateSSHTunnelReturnData:
    return await CreateSSHTunnel(sshtunnel)


@app.delete("/sshtunnel")
async def delete_sshtunnel(sshtunnel: DeleteSSHTunnelData) -> DeleteSSHTunnelReturnData:
    return await DeleteSSHTunnel(sshtunnel)


@app.post("/authorized_keys")
async def create_authorized_keys(
    authorized_keys: AuthorizedKeysData,
) -> AuthorizedKeysReturnData:
    return await CreateSSHAuthorizedKeysFile(authorized_keys)


@app.delete("/authorized_keys")
async def delete_authorized_keys(
    authorized_keys: DeleteAuthorizedKeysData,
) -> DeleteAuthorizedKeysReturnData:
    return await DeleteSSHAuthorizedKeysFile(authorized_keys)


@app.post("/init_user")
async def init_user(user: InitUserData) -> InitUserReturnData:
    return await InitUser(user)


@app.get("/gensshkey")
async def gen_ssh_key() -> SSHKeyGenReturnData:
    rsa_priv = RsaPrivateKey.generate(2048)
    res = SSHKeyGenReturnData(
        private_key=rsa_priv.to_string(), public_key=rsa_priv.public_key.to_string()
    )
    return res
