-- CreateEnum
CREATE TYPE "USER_TYPE" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "USER_STATE" AS ENUM ('ACTIVE', 'NEW', 'SETTING_UP');

-- CreateEnum
CREATE TYPE "CONTAINER_STATE" AS ENUM ('STARTED', 'STOPPED');

-- CreateEnum
CREATE TYPE "provision_status" AS ENUM ('PENDING', 'SUCCESS');

-- CreateEnum
CREATE TYPE "NODE_TYPE" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedSignup" TEXT NOT NULL DEFAULT 'false',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "user_state" "USER_STATE" NOT NULL DEFAULT 'NEW',
    "resources_limitId" TEXT NOT NULL,
    "user_type" "USER_TYPE" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vpc" (
    "id" TEXT NOT NULL,
    "vpc_name" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "available_vpcId" TEXT NOT NULL,

    CONSTRAINT "vpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "containers_scheduled" (
    "id" TEXT NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "ssh_keysId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "container_nickname" TEXT NOT NULL,

    CONSTRAINT "containers_scheduled_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "containers" (
    "name" TEXT NOT NULL,
    "nick_name" TEXT,
    "nodeId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "state" "CONTAINER_STATE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vpcId" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "ssh_config_id" TEXT NOT NULL,
    "ssh_keysId" TEXT NOT NULL,
    "provision_status" "provision_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "containers_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "inbound_rules" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "domain_name" TEXT NOT NULL,
    "service_protocol" TEXT NOT NULL,
    "container_ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "containersName" TEXT NOT NULL,
    "cloudflare_zone" TEXT NOT NULL,
    "cloudflare_record_id" TEXT NOT NULL,

    CONSTRAINT "inbound_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "available_vpc" (
    "id" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "available_vpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ssh_config" (
    "id" TEXT NOT NULL,
    "ssh_proxy_node_name" TEXT NOT NULL,
    "ssh_proxy_port" INTEGER NOT NULL,
    "ssh_tunnel_process_id" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "available_ssh_proxy_portsId" TEXT NOT NULL,

    CONSTRAINT "ssh_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "available_ssh_proxy_ports" (
    "id" TEXT NOT NULL,
    "ssh_proxy_node_name" TEXT NOT NULL,
    "ssh_proxy_port" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,

    CONSTRAINT "available_ssh_proxy_ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ssh_keys" (
    "id" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "UserDataId" TEXT NOT NULL,

    CONSTRAINT "ssh_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources_limit" (
    "id" TEXT NOT NULL,
    "vpc_limit" INTEGER NOT NULL DEFAULT 2,
    "container_limit" INTEGER NOT NULL DEFAULT 2,
    "ssh_key_limit" INTEGER NOT NULL DEFAULT 2,
    "inbound_rule_limit" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "resources_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL,
    "node_name" TEXT NOT NULL,
    "node_ip" TEXT NOT NULL,
    "node_type" "NODE_TYPE" NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_resources" (
    "id" TEXT NOT NULL,
    "total_cpu" INTEGER NOT NULL,
    "total_memory" INTEGER NOT NULL,
    "total_disk" INTEGER NOT NULL,
    "available_cpu" INTEGER NOT NULL,
    "available_memory" INTEGER NOT NULL,
    "available_disk" INTEGER NOT NULL,
    "containers_running" INTEGER NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "node_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_userId_key" ON "UserData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_resources_limitId_key" ON "UserData"("resources_limitId");

-- CreateIndex
CREATE UNIQUE INDEX "vpc_available_vpcId_key" ON "vpc"("available_vpcId");

-- CreateIndex
CREATE UNIQUE INDEX "containers_ssh_config_id_key" ON "containers"("ssh_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_rules_domain_name_key" ON "inbound_rules"("domain_name");

-- CreateIndex
CREATE UNIQUE INDEX "ssh_config_available_ssh_proxy_portsId_key" ON "ssh_config"("available_ssh_proxy_portsId");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_node_name_key" ON "nodes"("node_name");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_node_ip_key" ON "nodes"("node_ip");

-- CreateIndex
CREATE UNIQUE INDEX "node_resources_nodeId_key" ON "node_resources"("nodeId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_resources_limitId_fkey" FOREIGN KEY ("resources_limitId") REFERENCES "resources_limit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vpc" ADD CONSTRAINT "vpc_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vpc" ADD CONSTRAINT "vpc_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vpc" ADD CONSTRAINT "vpc_available_vpcId_fkey" FOREIGN KEY ("available_vpcId") REFERENCES "available_vpc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers_scheduled" ADD CONSTRAINT "containers_scheduled_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers_scheduled" ADD CONSTRAINT "containers_scheduled_ssh_keysId_fkey" FOREIGN KEY ("ssh_keysId") REFERENCES "ssh_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers_scheduled" ADD CONSTRAINT "containers_scheduled_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_vpcId_fkey" FOREIGN KEY ("vpcId") REFERENCES "vpc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_ssh_config_id_fkey" FOREIGN KEY ("ssh_config_id") REFERENCES "ssh_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_ssh_keysId_fkey" FOREIGN KEY ("ssh_keysId") REFERENCES "ssh_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_rules" ADD CONSTRAINT "inbound_rules_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_rules" ADD CONSTRAINT "inbound_rules_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_rules" ADD CONSTRAINT "inbound_rules_containersName_fkey" FOREIGN KEY ("containersName") REFERENCES "containers"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "available_vpc" ADD CONSTRAINT "available_vpc_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssh_config" ADD CONSTRAINT "ssh_config_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssh_config" ADD CONSTRAINT "ssh_config_available_ssh_proxy_portsId_fkey" FOREIGN KEY ("available_ssh_proxy_portsId") REFERENCES "available_ssh_proxy_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssh_keys" ADD CONSTRAINT "ssh_keys_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_resources" ADD CONSTRAINT "node_resources_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
