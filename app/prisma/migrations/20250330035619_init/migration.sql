-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "nodes";

-- CreateEnum
CREATE TYPE "public"."USER_TYPE" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."USER_STATE" AS ENUM ('ACTIVE', 'NEW', 'SETTING_UP');

-- CreateEnum
CREATE TYPE "public"."CONTAINER_STATE" AS ENUM ('STARTED', 'STOPPED');

-- CreateEnum
CREATE TYPE "public"."provision_status" AS ENUM ('PENDING', 'SUCCESS');

-- CreateEnum
CREATE TYPE "nodes"."NODE_TYPE" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "user_state" "public"."USER_STATE" NOT NULL DEFAULT 'NEW',
    "resources_limitId" TEXT NOT NULL,
    "user_type" "public"."USER_TYPE" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "public"."Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "public"."vpc" (
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
CREATE TABLE "public"."containers_scheduled" (
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
CREATE TABLE "public"."containers" (
    "name" TEXT NOT NULL,
    "nick_name" TEXT,
    "nodeId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "state" "public"."CONTAINER_STATE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vpcId" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "UserDataId" TEXT NOT NULL,
    "ssh_config_id" TEXT NOT NULL,
    "ssh_keysId" TEXT NOT NULL,
    "provision_status" "public"."provision_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "containers_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."inbound_rules" (
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
CREATE TABLE "public"."available_vpc" (
    "id" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "available_vpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ssh_config" (
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
CREATE TABLE "public"."available_ssh_proxy_ports" (
    "id" TEXT NOT NULL,
    "ssh_proxy_node_name" TEXT NOT NULL,
    "ssh_proxy_port" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,

    CONSTRAINT "available_ssh_proxy_ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ssh_keys" (
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
CREATE TABLE "public"."resources_limit" (
    "id" TEXT NOT NULL,
    "vpc_limit" INTEGER NOT NULL DEFAULT 2,
    "container_limit" INTEGER NOT NULL DEFAULT 2,
    "ssh_key_limit" INTEGER NOT NULL DEFAULT 2,
    "inbound_rule_limit" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "resources_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes"."nodes" (
    "id" TEXT NOT NULL,
    "node_name" TEXT NOT NULL,
    "node_ip" TEXT NOT NULL,
    "node_type" "nodes"."NODE_TYPE" NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes"."node_resources" (
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
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_userId_key" ON "public"."UserData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_resources_limitId_key" ON "public"."UserData"("resources_limitId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "public"."Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "vpc_available_vpcId_key" ON "public"."vpc"("available_vpcId");

-- CreateIndex
CREATE UNIQUE INDEX "containers_ssh_config_id_key" ON "public"."containers"("ssh_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_rules_domain_name_key" ON "public"."inbound_rules"("domain_name");

-- CreateIndex
CREATE UNIQUE INDEX "ssh_config_available_ssh_proxy_portsId_key" ON "public"."ssh_config"("available_ssh_proxy_portsId");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_node_name_key" ON "nodes"."nodes"("node_name");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_node_ip_key" ON "nodes"."nodes"("node_ip");

-- CreateIndex
CREATE UNIQUE INDEX "node_resources_nodeId_key" ON "nodes"."node_resources"("nodeId");

-- AddForeignKey
ALTER TABLE "public"."UserData" ADD CONSTRAINT "UserData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserData" ADD CONSTRAINT "UserData_resources_limitId_fkey" FOREIGN KEY ("resources_limitId") REFERENCES "public"."resources_limit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vpc" ADD CONSTRAINT "vpc_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vpc" ADD CONSTRAINT "vpc_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vpc" ADD CONSTRAINT "vpc_available_vpcId_fkey" FOREIGN KEY ("available_vpcId") REFERENCES "public"."available_vpc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers_scheduled" ADD CONSTRAINT "containers_scheduled_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers_scheduled" ADD CONSTRAINT "containers_scheduled_ssh_keysId_fkey" FOREIGN KEY ("ssh_keysId") REFERENCES "public"."ssh_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers_scheduled" ADD CONSTRAINT "containers_scheduled_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_vpcId_fkey" FOREIGN KEY ("vpcId") REFERENCES "public"."vpc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_ssh_config_id_fkey" FOREIGN KEY ("ssh_config_id") REFERENCES "public"."ssh_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_ssh_keysId_fkey" FOREIGN KEY ("ssh_keysId") REFERENCES "public"."ssh_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inbound_rules" ADD CONSTRAINT "inbound_rules_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inbound_rules" ADD CONSTRAINT "inbound_rules_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inbound_rules" ADD CONSTRAINT "inbound_rules_containersName_fkey" FOREIGN KEY ("containersName") REFERENCES "public"."containers"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."available_vpc" ADD CONSTRAINT "available_vpc_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ssh_config" ADD CONSTRAINT "ssh_config_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ssh_config" ADD CONSTRAINT "ssh_config_available_ssh_proxy_portsId_fkey" FOREIGN KEY ("available_ssh_proxy_portsId") REFERENCES "public"."available_ssh_proxy_ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ssh_keys" ADD CONSTRAINT "ssh_keys_UserDataId_fkey" FOREIGN KEY ("UserDataId") REFERENCES "public"."UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes"."node_resources" ADD CONSTRAINT "node_resources_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"."nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
