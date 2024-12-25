from pydantic import BaseModel
from typing import Literal


########################################## Container ###############################################
class ContainerData(BaseModel):
    container_name: str
    image: str
    tag: str
    network: str
    storage: str


class ContainerReturnData(BaseModel):
    container_ip: str
    return_code: int


class ContainerActions(BaseModel):
    container_name: str
    action: Literal["start", "stop", "restart"]


class ContainerActionsReturnData(BaseModel):
    return_code: int


########################################## Docker Network ##########################################
class DockerNetworkData(BaseModel):
    network_name: str
    network_subnet: str
    network_gateway: str


class DockerNetworkReturnData(BaseModel):
    return_code: int


########################################## Nginx Config ############################################
class CreateNginxConfigData(BaseModel):
    config_name: str
    domain_name: str
    protocol: str
    ip: str
    port: int
    container_name: str


class CreateNginxConfigReturnData(BaseModel):
    return_code: int


class DeleteNginxConfigData(BaseModel):
    config_name: str
    container_name: str


class DeleteNginxConfigReturnData(BaseModel):
    return_code: int
