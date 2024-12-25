from ansible_runner import run, Runner
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
)


########################################## Docker Network ##########################################
def CreateDockerNetwork(
    CreateNetworkData: DockerNetworkData,
) -> DockerNetworkReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="docker_network/create_network.yaml",
        extravars=CreateNetworkData.model_dump(),  # model_dump is converting to dict
    )
    ReturnData = DockerNetworkReturnData(return_code=res.rc)
    return ReturnData


def DeleteDockerNetwork(
    DeleteNetworkData: DockerNetworkData,
) -> DockerNetworkReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="docker_network/delete_network.yaml",
        extravars=DeleteNetworkData.model_dump(),  # model_dump is converting to dict
    )
    ReturnData = DockerNetworkReturnData(return_code=res.rc)
    return ReturnData


########################################## Nginx Config ############################################
def CreateNginxConfig(
    NginxConfigData: CreateNginxConfigData,
) -> CreateNginxConfigReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="nginx/create_config.yaml",
        extravars=NginxConfigData.model_dump(),  # model_dump is converting to dict
    )
    ReturnData = CreateNginxConfigReturnData(return_code=res.rc)
    return ReturnData


def DeleteNginxConfig(ConfigData: DeleteNginxConfigData) -> DeleteNginxConfigReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="nginx/delete_config.yaml",
        extravars=ConfigData.model_dump(),
    )
    return DeleteNginxConfigReturnData(return_code=res.rc)


########################################## Container ###############################################
def CreateContainer(ContainerData: ContainerData) -> ContainerReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="container/create_container.yaml",
        extravars=ContainerData.model_dump(),
    )
    container_ip = ""
    for event in res.events:
        try:
            container_ip = event["event_data"]["res"]["container"]["NetworkSettings"][
                "Networks"
            ]["loc"]["IPAddress"]
        except:
            # print("IPNotFound")
            pass
    ReturnData = ContainerReturnData(container_ip=container_ip, return_code=res.rc)
    return ReturnData


def DeleteContainer(ContainerData: ContainerData) -> ContainerReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="container/delete_container.yaml",
        extravars=ContainerData.model_dump(),
    )
    ReturnData = ContainerReturnData(container_ip="None", return_code=res.rc)
    return ReturnData


def ActionsContainer(data: ContainerActions) -> ContainerActionsReturnData:
    res: Runner = run(
        private_data_dir=".",
        playbook="container/container_actions.yaml",
        extravars=data.model_dump(),
    )
    ReturnData = ContainerActionsReturnData(return_code=res.rc)
    return ReturnData
