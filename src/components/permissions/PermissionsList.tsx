'use client';

import { useMemo } from 'react';
import styles from './PermissionsList.module.scss';
import {
    RolePermissionDefinitions,
    RolePermissionGroups,
    RolePermissions,
} from '@/lib/roles/enums';
import { resolvePermissionRequirements } from '@/lib/roles/utilities';
import Tooltip from '@/components/dashboard/components/Tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export type PermissionListChangeEvent = {
    permission: bigint;
    oldValue: boolean;
    newValue: boolean;
    oldPermissions: bigint;
    newPermissions: bigint;
};

function Item({
    permission,
    permissions,
    onChange = () => {},
    readOnly = false,
    cache,
}: {
    permission: RolePermissions;
    permissions: string | number | bigint;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
    cache: any;
}) {
    const definition = RolePermissionDefinitions[permission];
    const requirements = useMemo(
        () => resolvePermissionRequirements(permission, permissions, cache),
        [permission, permissions, cache]
    );

    const isReadOnly = Boolean(
        readOnly || requirements.followed.length || !requirements.met
    );

    const info = useMemo(() => {
        if (requirements.followed.length) {
            return (
                <>
                    <p>Followed by</p>
                    {requirements.followed.map((followed) => (
                        <p key={followed}>
                            {RolePermissionDefinitions[followed].name}
                        </p>
                    ))}
                </>
            );
        }
        if (requirements.missing.length) {
            return (
                <>
                    <p>Missing permissions:</p>
                    {requirements.missing.map((missing) => (
                        <p key={missing}>
                            {RolePermissionDefinitions[missing].name}
                        </p>
                    ))}
                </>
            );
        }
        return null;
    }, [requirements]);

    return (
        <div className={styles.Item}>
            <div className={styles.ItemInfo}>
                <span className={styles.Name}>{definition.name}</span>
                <span className={styles.Description}>
                    {definition.description}
                </span>
            </div>
            <Tooltip info={info} side="left" align="center">
                <label className={styles.Switch}>
                    <input
                        type="checkbox"
                        checked={requirements.value}
                        readOnly={isReadOnly}
                        // onChange={(e) => {}}
                        onChange={(e) => {
                            if (isReadOnly) return;
                            const oldValue = !!requirements.value;
                            const newValue = !requirements.value;
                            const oldPermissions = BigInt(permissions);
                            const newPermissions =
                                oldPermissions ^ BigInt(permission);
                            onChange({
                                permission: BigInt(permission),
                                oldValue,
                                newValue,
                                oldPermissions,
                                newPermissions,
                            });
                        }}
                    />
                    <span className={styles.Slider}></span>
                </label>
            </Tooltip>
        </div>
    );
}

function Group({
    groupKey,
    permissions,
    onChange = () => {},
    readOnly = false,
    cache,
}: {
    groupKey: string;
    permissions: string | number | bigint;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
    cache: any;
}) {
    const group = RolePermissionGroups[groupKey];

    return (
        <div className={styles.Group}>
            <h3 className={styles.Name}>{group.name}</h3>
            <p className={styles.Description}>{group.description}</p>
            <div className={styles.Items}>
                {group.permissions.map((permission: RolePermissions) => (
                    <Item
                        key={permission}
                        permission={permission}
                        permissions={permissions}
                        onChange={onChange}
                        readOnly={readOnly}
                        cache={cache}
                    />
                ))}
            </div>
        </div>
    );
}

// TODO: OPTIMIZE
export default function PermissionsList({
    permissions = BigInt(0),
    onChange = () => {},
    readOnly = false,
    isRoot = false,
}: {
    permissions: string | number | bigint;
    onChange?: (event: PermissionListChangeEvent) => void;
    readOnly?: boolean;
    isRoot?: boolean;
}) {
    const cache = {};
    const groups = Object.keys(RolePermissionGroups);

    return (
        <TooltipProvider>
            <div className={styles.List}>
                {isRoot && (
                    <div className={styles.Root}>
                        <p>Root user</p>
                    </div>
                )}
                {groups.map((groupKey: string) => (
                    <Group
                        key={groupKey}
                        groupKey={groupKey}
                        permissions={permissions}
                        onChange={onChange}
                        readOnly={readOnly}
                        cache={cache}
                    />
                ))}
            </div>
        </TooltipProvider>
    );
}
