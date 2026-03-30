module.exports = (owner_uuid, serverName, locationID) => {
    // Translation fallback for location
    const locMap = { 1: "d5c51f13-962a-4c2a-9b02-abd87ab28935" };
    const locUUID = locMap[locationID] || "d5c51f13-962a-4c2a-9b02-abd87ab28935";

    return {
        serverType: "botserver",
        data: {
            name: `[Free] ${owner_uuid} ${serverName}`,
            owner_uuid: owner_uuid,
            egg_uuid: "79ed2eab-d4fe-4436-b099-5af6eb16b684",
            image: "ghcr.io/sigma-production/nginx-ptero:8.4",
            startup: "{{STARTUP_CMD}}",
            limits: {
                memory: 512,
                swap: 0,
                disk: 2048,
                io_weight: 500,
                cpu: 100,
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
                    "env_variable": "STARTUP_CMD",
                    "value": "./start.sh"
          },
          {
                    "env_variable": "WORDPRESS",
                    "value": "0"
          },
          {
                    "env_variable": "COMPOSER_MODULES",
                    "value": ""
          },
          {
                    "env_variable": "GIT_ADDRESS",
                    "value": ""
          },
          {
                    "env_variable": "BRANCH",
                    "value": ""
          },
          {
                    "env_variable": "AUTO_UPDATE",
                    "value": "0"
          },
          {
                    "env_variable": "USER_UPLOAD",
                    "value": "0"
          },
          {
                    "env_variable": "USERNAME",
                    "value": ""
          },
          {
                    "env_variable": "ACCESS_TOKEN",
                    "value": ""
          },
          {
                    "env_variable": "NAMELESSMC",
                    "value": "0"
          }
]
        }
    }
}
