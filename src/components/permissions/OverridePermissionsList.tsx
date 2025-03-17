'use client';

import classNames from 'classnames';
import styles from './OverridePermissionsList.module.scss';
import _ from 'lodash';
export type OverridePermissionListChangeEvent = {
    permission: bigint;
    oldValue: 'allow' | 'deny' | 'none';
    newValue: 'allow' | 'deny' | 'none';
    oldPermissions: {
        allow: bigint;
        deny: bigint;
    };
    newPermissions: {
        allow: bigint;
        deny: bigint;
    };
};

function OverrideItem({
    permissionDefinition,
    permissions,
    onChange = () => {},
    readOnly = false,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    permissionDefinition: any;
    onChange?: (event: OverridePermissionListChangeEvent) => void;
    readOnly?: boolean;
}) {
    const isDeny =
        (BigInt(permissions.deny) & BigInt(permissionDefinition.value)) !==
        BigInt(0);
    const isAllow =
        !isDeny &&
        (BigInt(permissions.allow) & BigInt(permissionDefinition.value)) !==
            BigInt(0);

    const updatePermission = (newValue: 'allow' | 'deny' | 'none') => {
        if (readOnly) return;

        let newAllow = BigInt(permissions.allow);
        let newDeny = BigInt(permissions.deny);

        if (newValue === 'allow') {
            newAllow = newAllow | BigInt(permissionDefinition.value);
            newDeny = newDeny & ~BigInt(permissionDefinition.value);
        } else if (newValue === 'deny') {
            newDeny = newDeny | BigInt(permissionDefinition.value);
            newAllow = newAllow & ~BigInt(permissionDefinition.value);
        } else {
            newAllow = newAllow & ~BigInt(permissionDefinition.value);
            newDeny = newDeny & ~BigInt(permissionDefinition.value);
        }

        onChange({
            permission: permissionDefinition.value,
            oldValue: isDeny ? 'deny' : isAllow ? 'allow' : 'none',
            newValue,
            oldPermissions: {
                allow: BigInt(permissions.allow),
                deny: BigInt(permissions.deny),
            },
            newPermissions: {
                allow: newAllow,
                deny: newDeny,
            },
        });
    };

    return (
        <div className={styles.Item}>
            <div className={styles.ItemInfo}>
                <span className={styles.Name}>{permissionDefinition.name}</span>
                <span className={styles.Description}>
                    {permissionDefinition.description}
                </span>
            </div>
            <div className={styles.Buttons}>
                <button
                    className={classNames(styles.Button, styles.Deny, {
                        [styles.Selected]: isDeny,
                    })}
                    onClick={() => updatePermission('deny')}
                >
                    🔴
                </button>

                <button
                    className={classNames(styles.Button, styles.None, {
                        [styles.Selected]: !isAllow && !isDeny,
                    })}
                    onClick={() => updatePermission('none')}
                >
                    /
                </button>
                <button
                    className={classNames(styles.Button, styles.Allow, {
                        [styles.Selected]: isAllow,
                    })}
                    onClick={() => updatePermission('allow')}
                >
                    🟢
                </button>
            </div>
        </div>
    );
}

function OverrideGroup({
    permissions,
    groupDefinition,
    onChange = () => {},
    readOnly = false,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    groupDefinition: any;
    onChange?: (event: OverridePermissionListChangeEvent) => void;
    readOnly?: boolean;
}) {
    return (
        <div className={styles.Group}>
            <h3 className={styles.Name}>{groupDefinition.name}</h3>
            <p className={styles.Description}>{groupDefinition.description}</p>
            <div className={styles.Items}>
                {groupDefinition.permissions.map((permission: any) => (
                    <OverrideItem
                        key={String(permission.value)}
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

export default function OverridePermissionsList({
    permissions = { allow: BigInt(0), deny: BigInt(0) },
    definition,
    onChange = () => {},
    readOnly = false,
    isRoot = false,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    definition: any;
    onChange?: (event: OverridePermissionListChangeEvent) => void;
    readOnly?: boolean;
    isRoot?: boolean;
}) {
    permissions = _.defaults(permissions, {
        allow: BigInt(0),
        deny: BigInt(0),
    });
    return (
        <div className={styles.List}>
            {isRoot && (
                <div className={styles.Root}>
                    <p>Root user</p>
                </div>
            )}
            {definition.groups.map((group: any) => (
                <OverrideGroup
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
