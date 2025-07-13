# Schema Sync Workflow Disabled

The schema-sync workflow has been causing build failures due to incompatible project structure expectations.

## To re-enable:
1. Update the workflow to match the actual project structure
2. Ensure all required dependencies are installed
3. Create missing directories: src/lib, src/types/generated, src/services

## Current status: DISABLED to allow production deployments