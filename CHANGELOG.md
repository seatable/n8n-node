# Changelog

## Released (2024-12-12 2.0.1)

- All dtable-db and dtable-server endpoints were replaced with api-gateway
- Added new convert options to some actions
- Lint fixes for merge into n8n-core

## Released (2024-08-16 1.6.4)

- Fixed: Date input values in the `create row` operation were incorrectly transformed

## Released (2024-07-10 1.6.3)

- Fixed: loadOptions of action ListRows

## Released (2024-07-08 1.6.2)

- Rebuild actions to new structure

## Released (2024-06-14 1.6.0)

- Fixed all linting errors
- New action: get row links

## Released (2024-06-13 1.5.4)

Asset upload: fix edge cases

## Released (2024-05-28 1.5.2)

Fix error in upload action, if server domain ends with '/'

## Released (2024-01-29 1.5.1)

Minor fix for old version 1

## Released (2024-01-29 1.5.0)

Big Data support implemented

- `create row` got a new option to write to normal or big data backend
- `update row` can update normal and big data rows
- `delete row` can delete rows from any backend
- `link rows` can link rows from any backend
- `unlink rows` supports big data and normal backend

## Released (2024-01-08 1.4.0)

improved "Upload Asset"

- input `workspaceId` is not needed anymore
- new options `Replace existing file` and `Append to column`

## Released (2023-12-21 1.3.6)

- fix "Make an API Call"

## Released (2023-12-15 1.3.5)

- added new action "Get many rows"
- new option in "search" action: Case Insensitive Search

## Released (2023-12-05 1.3.3)

## Bug fixes

- added missing loadOptionsDependsOn for update a row action

## Released (2023-12-01 1.3.2)

### Bug fixes

- Fixing wrong file paths for uploaded images and files.

## Released (2023-10-26 1.3.0)

Finalisation of rework. All actions and triggers are fully functional.

### Bug fixes

- Trigger Test Event shows only up to three items
- Triggers show test results
- Get action: loadoptions depency added for row id
- Upload action: correct workspace_id handling

## Released (2023-10-24 1.2.0)

### Wording issues

- Change of the README.md

### Bug fixes

- Triggers were not shown, because n8n Triggers does not support versioning
- Action "Upload a file/image" does not work

## Released (2023-10-11 1.0.0)

### New Features

- Complete rework of the existing n8n node. 10 new actions and two new triggers were added.
- Versioning of the actions
