'use client';

import styles from './PermissionsList.module.scss';

export type PermissionListChangeEvent = {
    permission: bigint;
    oldValue: boolean;
    newValue: boolean;
    oldPermissions: bigint;
    newPermissions: bigint;
};

function Item({
    permissionDefinition,
    permissions,
    onChange = () => {},
    readOnly = false,
}: {
    permissionDefinition: any;
    permissions: string | number | bigint;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
}) {
    const isOn = Boolean(
        permissions && BigInt(permissions) & BigInt(permissionDefinition.value)
    );

    return (
        <div className={styles.Item}>
            <div className={styles.ItemInfo}>
                <span className={styles.Name}>{permissionDefinition.name}</span>
                <span className={styles.Description}>
                    {permissionDefinition.description}
                </span>
            </div>
            <label className={styles.Switch}>
                <input
                    type="checkbox"
                    checked={Boolean(isOn)}
                    readOnly={readOnly}
                    onChange={(e) => {
                        const oldValue = !!isOn;
                        const newValue = !isOn;
                        const oldPermissions = BigInt(permissions);
                        const newPermissions =
                            BigInt(permissions) ^
                            BigInt(permissionDefinition.value);
                        onChange({
                            permission: permissionDefinition.value,
                            oldValue,
                            newValue,
                            oldPermissions,
                            newPermissions,
                        });
                    }}
                />
                <span className={styles.Slider}></span>
            </label>
        </div>
    );
}

function Group({
    permissions,
    groupDefinition,
    onChange = () => {},
    readOnly = false,
}: {
    permissions: string | number | bigint;
    groupDefinition: any;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
}) {
    return (
        <div className={styles.Group}>
            <h3 className={styles.Name}>{groupDefinition.name}</h3>
            <p className={styles.Description}>{groupDefinition.description}</p>
            <div className={styles.Items}>
                {groupDefinition.permissions.map((permission: any) => (
                    <Item
                        key={permission.value}
                        permissionDefinition={permission}
                        permissions={permissions}
                        onChange={onChange}
                        readOnly={readOnly}
                    />
                ))}
            </div>
        </div>
    );
}
export default function PermissionsList({
    permissions = BigInt(0),
    definition,
    onChange = () => {},
    readOnly = false,
}: {
    permissions: string | number | bigint;
    definition: any;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
}) {
    return (
        <div className={styles.List}>
            {definition.groups.map((group: any) => (
                <Group
                    key={group.name}
                    groupDefinition={group}
                    permissions={permissions}
                    onChange={onChange}
                    readOnly={readOnly}
                />
            ))}
        </div>
    );
}
