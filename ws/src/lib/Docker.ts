import Dockerode from "dockerode";

export const docker = new Dockerode({
  host: "http://192.168.31.48",
  port: 2375,
});
