export const calculateStats = (chunk: Buffer) => {
  const incoming_stats_string = chunk.toString();
  const incoming_stats = JSON.parse(incoming_stats_string);

  //   get necessary stats
  const { memory_stats, cpu_stats, precpu_stats } = incoming_stats;

  // calculate in bytes
  // cgroupv2 [cache, rss not available], new metric
  const used_memory = memory_stats.usage - memory_stats.stats.anon;
  const available_memory = memory_stats.limit;
  const memory_usage_percentage = (used_memory / available_memory) * 100;
  const cpu_delta =
    cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
  const system_cpu_delta =
    cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;
  const number_cpus = cpu_stats.online_cpus;
  const cpu_usage_percentage =
    (cpu_delta / system_cpu_delta) * number_cpus * 100.0;

  // in mb
  const memory_usage = `${used_memory / 1048576}MB / ${
    available_memory / 1073741824
  }GB`;

  const allStats = {
    used_memory,
    available_memory,
    memory_usage_percentage,
    cpu_delta,
    system_cpu_delta,
    number_cpus,
    cpu_usage_percentage,
    memory_usage,
  };
  console.log(allStats);

  return allStats;
};
