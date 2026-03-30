module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "gameserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "464aa766-295a-46fc-8094-db093090db9b",
            image: "ghcr.io/luxxy-gf/temurin-25:latest",
            startup: "./start.sh",
            limits: {
                memory: 3072,
                swap: 0,
                disk: 15360,
                io_weight: 500,
                cpu: 200,
                memory_overhead: 0
            },
            feature_limits: {
                databases: 1,
                allocations: 1,
                backups: 0,
                schedules: 0
            },
            deployment: {
                location_uuids: [ locUUID ],
                allow_overallocation: true
            },
            start_on_completion: false,
            skip_installer: false,
            hugepages_passthrough_enabled: false,
            kvm_passthrough_enabled: false,
            pinned_cpus: [],
            variables: [
          {
                    "env_variable": "ASSETS_PATH",
                    "value": "Assets.zip"
          },
          {
                    "env_variable": "AUTH_MODE",
                    "value": "authenticated"
          },
          {
                    "env_variable": "ACCEPT_EARLY_PLUGINS",
                    "value": "0"
          },
          {
                    "env_variable": "ALLOW_OP",
                    "value": "0"
          },
          {
                    "env_variable": "ENABLE_BACKUPS",
                    "value": "0"
          },
          {
                    "env_variable": "BACKUP_DIR",
                    "value": "backups"
          },
          {
                    "env_variable": "BACKUP_FREQUENCY",
                    "value": "60"
          }
]
        }
    }
}
