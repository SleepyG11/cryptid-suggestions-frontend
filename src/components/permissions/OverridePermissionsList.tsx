'use client';

import classNames from 'classnames';
import styles from './OverridePermissionsList.module.scss';
import _ from 'lodash';
import { useMemo } from 'react';
import {
    RolePermissionDefinitions,
    RolePermissionGroups,
    RolePermissions,
} from '@/lib/roles/enums';
import {
    resolvePermissionRequirements,
    resolveDenyPermissionRequirements,
    calculatePermissions,
    calculateDenyPermissions,
} from '@/lib/roles/utilities';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Tooltip from '@/components/dashboard/components/Tooltip';

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
    permission,
    permissions,
    onChange = () => {},
    readOnly = false,
    cache,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    permission: RolePermissions;
    onChange?: (event: OverridePermissionListChangeEvent) => void;
    readOnly?: boolean;
    cache: any;
}) {
    const definition = RolePermissionDefinitions[permission];
    const requirements = useMemo(() => {
        return {
            allow: resolvePermissionRequirements(
                permission,
                permissions.allow,
                cache.allow
            ),
            deny: resolveDenyPermissionRequirements(
                permission,
                permissions.deny,
                cache.deny
            ),
        };
    }, [permission, permissions, cache]);

    const isDeny = requirements.deny.value;
    const isAllow = !isDeny && requirements.allow.value;

    const isReadOnly = Boolean(
        readOnly ||
            requirements.deny.followed.length ||
            requirements.allow.followed.length
    );

    const updatePermission = (newValue: 'allow' | 'deny' | 'none') => {
        if (readOnly) return;
        let newAllow = BigInt(permissions.allow);
        let newDeny = BigInt(permissions.deny);

        switch (newValue) {
            case 'allow':
                newAllow = newAllow | BigInt(permission);
                newDeny = newDeny & ~BigInt(permission);
                break;
            case 'deny':
                newDeny = newDeny | BigInt(permission);
                newAllow = newAllow & ~BigInt(permission);
                break;
            case 'none':
                newAllow = newAllow & ~BigInt(permission);
                newDeny = newDeny & ~BigInt(permission);
                break;
        }

        onChange({
            permission: BigInt(permission),
            oldValue: isDeny ? 'deny' : isAllow ? 'allow' : 'none',
            newValue,
            oldPermissions: {
                allow: BigInt(permissions.allow),
                deny: BigInt(permissions.deny),
            },
            newPermissions: {
                allow: calculatePermissions(newAllow),
                deny: calculateDenyPermissions(newDeny),
            },
        });
    };

    const followedInfo = useMemo(() => {
        const followed = requirements.deny.followed.length
            ? requirements.deny.followed
            : requirements.allow.followed;
        if (followed.length) {
            return (
                <>
                    <p>Followed by</p>
                    {followed.map((followed) => (
                        <p key={followed}>
                            {RolePermissionDefinitions[followed].name}
                        </p>
                    ))}
                </>
            );
        }
        return null;
    }, [requirements]);

    const allowMissingInfo = useMemo(() => {
        if (followedInfo) return null;
        if (requirements.allow.missing.length) {
            return (
                <>
                    <p>Missing allow permissions:</p>
                    {requirements.allow.missing.map((role) => (
                        <p key={role}>{RolePermissionDefinitions[role].name}</p>
                    ))}
                </>
            );
        }
        return null;
    }, [requirements, followedInfo]);

    const denyMissingInfo = useMemo(() => {
        if (followedInfo) return null;
        if (requirements.deny.missing.length) {
            return (
                <>
                    <p>Missing deny permissions:</p>
                    {requirements.deny.missing.map((role) => (
                        <p key={role}>{RolePermissionDefinitions[role].name}</p>
                    ))}
                </>
            );
        }
        return null;
    }, [requirements, followedInfo]);

    return (
        <div className={styles.Item}>
            <div className={styles.ItemInfo}>
                <span className={styles.Name}>{definition.name}</span>
                <span className={styles.Description}>
                    {definition.description}
                </span>
            </div>
            <Tooltip info={followedInfo}>
                <div
                    className={classNames(styles.Buttons, {
                        [styles.ReadOnly]: isReadOnly,
                    })}
                >
                    <Tooltip info={denyMissingInfo}>
                        <button
                            className={classNames(styles.Button, styles.Deny, {
                                [styles.Selected]: isDeny,
                                [styles.ReadOnly]:
                                    isReadOnly || !requirements.deny.met,
                            })}
                            onClick={() => updatePermission('deny')}
                        >
                            🔴
                        </button>
                    </Tooltip>

                    <button
                        className={classNames(styles.Button, styles.None, {
                            [styles.Selected]: !isAllow && !isDeny,
                            [styles.ReadOnly]: isReadOnly,
                        })}
                        onClick={() => updatePermission('none')}
                    >
                        /
                    </button>
                    <Tooltip info={allowMissingInfo}>
                        <button
                            className={classNames(styles.Button, styles.Allow, {
                                [styles.Selected]: isAllow,
                                [styles.ReadOnly]:
                                    isReadOnly || !requirements.allow.met,
                            })}
                            onClick={() => updatePermission('allow')}
                        >
                            🟢
                        </button>
                    </Tooltip>
                </div>
            </Tooltip>
        </div>
    );
}

function OverrideGroup({
    groupKey,
    permissions,
    onChange = () => {},
    readOnly = false,
    cache,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    groupKey: string;
    onChange?: (event: OverridePermissionListChangeEvent) => void;
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
                    <OverrideItem
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
export default function OverridePermissionsList({
    permissions = { allow: BigInt(0), deny: BigInt(0) },
    onChange = () => {},
    readOnly = false,
    isRoot = false,
}: {
    permissions: {
        allow: string | number | bigint;
        deny: string | number | bigint;
    };
    onChange?: (event: OverridePermissionListChangeEvent) => void;
    readOnly?: boolean;
    isRoot?: boolean;
}) {
    const currentPermissions = _.defaults(permissions, {
        allow: BigInt(0),
        deny: BigInt(0),
    });

    const cache = {
        allow: {},
        deny: {},
    };

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
                    <OverrideGroup
                        key={groupKey}
                        groupKey={groupKey}
                        permissions={currentPermissions}
                        onChange={onChange}
                        readOnly={readOnly}
                        cache={cache}
                    />
                ))}
            </div>
        </TooltipProvider>
    );
}
