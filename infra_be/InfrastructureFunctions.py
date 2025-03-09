from ansible_runner import Runner, run_async
from type import (
    DockerNetworkData,
    DockerNetworkReturnData,
    CreateNginxConfigData,
    ContainerData,
    ContainerReturnData,
    CreateNginxConfigReturnData,
    DeleteNginxConfigData,
    DeleteNginxConfigReturnData,
    ContainerActions,
    ContainerActionsReturnData,
    CreateSSHTunnelData,
    CreateSSHTunnelReturnData,
    DeleteSSHTunnelData,
    DeleteSSHTunnelReturnData,
    AuthorizedKeysData,
    AuthorizedKeysReturnData,
    InitUserData,
    InitUserReturnData,
    DeleteAuthorizedKeysData,
    DeleteAuthorizedKeysReturnData,
    DeleteContainerData,
    DeleteContainerReturnData,
    EditNginxConfigData,
    EditNginxConfigReturnData,
    DockerNetworkDeleteData,
    DockerNetworkDeleteReturnData,
)
import threading
from typing import Tuple
import asyncio
from docker import DockerClient, types as docker_types
from docker.models.containers import Container
from docker.errors import APIError
import os
from dotenv import load_dotenv
import time

load_dotenv()

# TODO: create a class which return the specific dockerclient, if not present it will create and return. The connection credentials will be stored in a separate database.
# TODO: update functions to use dockerclient based on the request parameter `dockerHostName`
docker_client = DockerClient(base_url=os.environ.get("DOCKER_HOST"))


########################################## Container ###############################################
async def CreateContainer(ContainerData: ContainerData) -> ContainerReturnData:
    try:
        key_host_path = "/caas/ssh_keys/%s/%s/authorized_keys" % (
            ContainerData.userData_id,
            ContainerData.container_name,
        )

        container_detail: Container = docker_client.containers.run(
            name=ContainerData.container_name,
            image=ContainerData.image + ":" + ContainerData.tag,
            network=ContainerData.network,
            cpu_count=1,
            mem_limit="512m",
            volumes={key_host_path: {"bind": "/root/.ssh/authorized_keys"}},
            detach=True,
        )

        while (
            container_detail.attrs["NetworkSettings"]["Networks"][
                ContainerData.network
            ]["IPAddress"]
            == ""
        ):
            time.sleep(1)
            container_detail.reload()

        ReturnData = ContainerReturnData(
            container_ip=container_detail.attrs["NetworkSettings"]["Networks"][
                ContainerData.network
            ]["IPAddress"],
            return_code=0,
        )
        return ReturnData
    except APIError as e:
        print(e)
        return ContainerReturnData(container_ip="", return_code=1)


async def DeleteContainer(
    ContainerData: DeleteContainerData,
) -> DeleteContainerReturnData:
    try:
        container = docker_client.containers.get(
            container_id=ContainerData.container_name
        )
        container.remove(force=True)
        return DeleteContainerReturnData(return_code=0)
    except APIError as e:
        print(e)
        return DeleteContainerReturnData(return_code=e.status_code)


async def ActionsContainer(data: ContainerActions) -> ContainerActionsReturnData:
    try:
        container = docker_client.containers.get(data.container_name)
        if data.action == "start":
            container.start()
        elif data.action == "stop":
            container.stop()
        elif data.action == "restart":
            container.restart()
        ReturnData = ContainerActionsReturnData(return_code=0)
        return ReturnData
    except APIError as e:
        print(e)
        return ContainerActionsReturnData(return_code=e.status_code)


########################################## Docker Network ##########################################
async def CreateDockerNetwork(
    CreateNetworkData: DockerNetworkData,
) -> DockerNetworkReturnData:
    try:
        ipam_pool = docker_types.IPAMPool(
            subnet=CreateNetworkData.network_subnet,
            gateway=CreateNetworkData.network_gateway,
        )
        ipam_config = docker_types.IPAMConfig(pool_configs=[ipam_pool])
        docker_client.networks.create(
            name=CreateNetworkData.network_name,
            driver="bridge",
            ipam=ipam_config,
        )
        ReturnData = DockerNetworkReturnData(return_code=0)
        return ReturnData
    except APIError as e:
        print(e)
        return DockerNetworkReturnData(return_code=e.status_code)


async def DeleteDockerNetwork(
    DeleteNetworkData: DockerNetworkDeleteData,
) -> DockerNetworkDeleteReturnData:
    try:
        network = docker_client.networks.get(DeleteNetworkData.network_name)
        network.remove()
        ReturnData = DockerNetworkReturnData(return_code=0)
        return ReturnData
    except APIError as e:
        print(e)
        return DockerNetworkReturnData(return_code=e.status_code)


########################################## Nginx Config ############################################
async def CreateNginxConfig(
    NginxConfigData: CreateNginxConfigData,
) -> CreateNginxConfigReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="nginx/create_config.yaml",
        extravars=NginxConfigData.model_dump(),  # model_dump is converting to dict
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = CreateNginxConfigReturnData(return_code=res.rc)
    return ReturnData


async def DeleteNginxConfig(
    ConfigData: DeleteNginxConfigData,
) -> DeleteNginxConfigReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="nginx/delete_config.yaml",
        extravars=ConfigData.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    return DeleteNginxConfigReturnData(return_code=res.rc)


async def EditNginxConfig(
    NginxConfigData: EditNginxConfigData,
) -> EditNginxConfigReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="nginx/edit_config.yaml",
        extravars=NginxConfigData.model_dump(),  # model_dump is converting to dict
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = EditNginxConfigReturnData(return_code=res.rc)
    return ReturnData


########################################## SSH Tunnel ###############################################
async def CreateSSHTunnel(data: CreateSSHTunnelData) -> CreateSSHTunnelReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="ssh/start_ssh_tunnel.yaml",
        extravars=data.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    tunnel_pid = ""
    for event in res.events:
        try:
            tunnel_pid = event["event_data"]["res"]["stdout"]
        except:
            pass
    ReturnData = CreateSSHTunnelReturnData(
        return_code=res.rc, ssh_tunnel_pid=tunnel_pid
    )
    return ReturnData


async def DeleteSSHTunnel(data: DeleteSSHTunnelData) -> DeleteSSHTunnelReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="ssh/stop_ssh_tunnel.yaml",
        extravars=data.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = DeleteSSHTunnelReturnData(return_code=res.rc)
    return ReturnData


async def CreateSSHAuthorizedKeysFile(
    data: AuthorizedKeysData,
) -> AuthorizedKeysReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="ssh/create_ssh_authorized_key_file.yaml",
        extravars=data.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = AuthorizedKeysReturnData(return_code=res.rc)
    return ReturnData


async def DeleteSSHAuthorizedKeysFile(
    data: DeleteAuthorizedKeysData,
) -> DeleteAuthorizedKeysReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="ssh/delete_ssh_authorized_key_file.yaml",
        extravars=data.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = DeleteAuthorizedKeysReturnData(return_code=res.rc)
    return ReturnData


########################################## user ###############################################


async def InitUser(
    data: InitUserData,
) -> InitUserReturnData:
    res_async: Tuple[threading.Thread, Runner] = run_async(
        private_data_dir=".",
        playbook="init_user.yaml",
        extravars=data.model_dump(),
    )
    res = res_async[1]
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, res_async[0].join)
    ReturnData = InitUserReturnData(return_code=res.rc)
    return ReturnData
