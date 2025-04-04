import { RolePermissions, RolePermissionDefinitions } from './enums';

export type PermissionRequirements = {
    /** The permission that is being checked */
    permission: RolePermissions;
    /** Whether the permission is present in the current permissions */
    present: boolean;
    /** The valid value of the permission */
    value: boolean;
    /** Whether the permission is valid after all checks */
    valid: boolean;
    /** List of permissions that are followed */
    followed: RolePermissions[];
    /** Whether the permission requirements are met */
    met: boolean;
    /** The missing permissions, if requirements are not met */
    missing: RolePermissions[];
    /** True if permission is not found in definition */
    invalid?: boolean;
};
export type DenyPermissionRequirements = {
    /** The permission that is being checked */
    permission: RolePermissions;
    /** Whether the permission is present in the current permissions */
    present: boolean;
    /** The valid value of the permission */
    value: boolean;
    /** Whether the permission is valid after all checks */
    valid: boolean;
    /** List of permissions that are followed */
    followed: RolePermissions[];
    /** Whether the permission requirements are met */
    met: boolean;
    /** The missing permissions, if requirements are not met */
    missing: RolePermissions[];
    /** True if permission is not found in definition */
    invalid?: boolean;
};

// ------

export function resolvePermissionRequirements(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    cache?: Record<RolePermissions, PermissionRequirements>
): PermissionRequirements {
    if (cache && cache[permission]) {
        return cache[permission];
    }
    cache ??= {} as Record<RolePermissions, PermissionRequirements>;

    const definition = RolePermissionDefinitions[permission];
    if (!definition) {
        return {
            permission,
            present: false,
            value: false,
            valid: false,
            followed: [],
            met: false,
            missing: [],
            invalid: true,
        };
    }

    const permissionBits = BigInt(currentPermissions);
    const present = (permissionBits & BigInt(permission)) !== 0n;

    // Check if followed permissions is present
    if (definition.follows) {
        const followedResult = resolvePermissionRequirements(
            definition.follows,
            currentPermissions,
            cache
        );
        if (followedResult.value || followedResult.followed.length) {
            return (cache[permission] = {
                permission,
                present,
                value: true,
                followed: [definition.follows].concat(followedResult.followed),
                valid: followedResult.valid,
                met: followedResult.met,
                missing: followedResult.missing,
            });
        }
    }

    // Check if required permissions are present
    if (definition.required?.length) {
        let missing: RolePermissions[] = [];

        const requirementsResults = definition.required.map((required) =>
            resolvePermissionRequirements(required, currentPermissions, cache)
        );
        const requirementsMissing = requirementsResults.filter(
            (result) => !(result.value || result.followed.length)
        );
        if (requirementsMissing.length) {
            const missingSet = requirementsMissing.map(
                (result) => result.permission
            );
            requirementsMissing.forEach((result) => {
                missingSet.push(...result.missing);
            });
            missing = Array.from(new Set(missingSet));
        }
        const met = !missing.length;
        const value = met && present;
        const valid = value == present;
        return (cache[permission] = {
            permission,
            present,
            value,
            valid,
            followed: [],
            met,
            missing,
        });
    } else {
        return (cache[permission] = {
            permission,
            present,
            value: present,
            valid: true,
            followed: [],
            met: true,
            missing: [],
        });
    }
}

export function resolveDenyPermissionRequirements(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    cache?: Record<RolePermissions, PermissionRequirements>
): PermissionRequirements {
    if (cache && cache[permission]) {
        return cache[permission];
    }
    cache ??= {} as Record<RolePermissions, PermissionRequirements>;

    const definition = RolePermissionDefinitions[permission];
    if (!definition) {
        return {
            permission,
            present: false,
            value: false,
            valid: false,
            followed: [],
            met: false,
            missing: [],
            invalid: true,
        };
    }

    const permissionBits = BigInt(currentPermissions);
    const present = (permissionBits & BigInt(permission)) !== 0n;

    // Follow required permissions
    if (definition.required?.length) {
        let followed: RolePermissions[] = [];

        const followedResults = definition.required.map((required) =>
            resolveDenyPermissionRequirements(
                required,
                currentPermissions,
                cache
            )
        );
        const followedValid = followedResults.filter(
            (result) => result.present || result.followed.length
        );
        if (followedValid.length) {
            const followedSet = followedValid.map(
                (result) => result.permission
            );
            followedValid.forEach((result) => {
                followed.push(...result.followed);
            });
            followed = Array.from(new Set(followedSet));

            return (cache[permission] = {
                permission,
                present,
                value: true,
                followed,
                valid: false,
                met: true,
                missing: [],
            });
        }
    }

    // Require follow permission
    if (definition.follows) {
        let missing: RolePermissions[] = [];

        const requirementsResults = [definition.follows].map((required) =>
            resolveDenyPermissionRequirements(
                required,
                currentPermissions,
                cache
            )
        );
        const requirementsMissing = requirementsResults.filter(
            (result) => !(result.present || result.followed)
        );
        if (requirementsMissing.length) {
            const missingSet = requirementsMissing.map(
                (result) => result.permission
            );
            requirementsMissing.forEach((result) => {
                missingSet.push(...result.missing);
            });
            missing = Array.from(new Set(missingSet));
        }
        const met = !missing.length;
        const value = met && present;
        const valid = value == present;

        return (cache[permission] = {
            permission,
            present,
            value,
            valid,
            followed: [],
            met,
            missing,
        });
    } else {
        return (cache[permission] = {
            permission,
            present,
            value: present,
            valid: true,
            followed: [],
            met: true,
            missing: [],
        });
    }
}

// ------

export function calculatePermission(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    cache?: Record<RolePermissions, PermissionRequirements>
) {
    return resolvePermissionRequirements(permission, currentPermissions, cache)
        .value;
}

export function calculateDenyPermission(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    cache?: Record<RolePermissions, PermissionRequirements>
) {
    return resolveDenyPermissionRequirements(
        permission,
        currentPermissions,
        cache
    ).value;
}

// ------

export function calculatePermissions(
    currentPermissions: string | number | bigint
) {
    const cache = {} as Record<RolePermissions, PermissionRequirements>;

    let result = 0n;
    for (const definition of Object.values(RolePermissionDefinitions)) {
        const value = calculatePermission(
            definition.value,
            currentPermissions,
            cache
        );
        if (value) result |= BigInt(definition.value);
    }
    return result;
}

export function calculateDenyPermissions(
    currentPermissions: string | number | bigint
) {
    const cache = {} as Record<RolePermissions, PermissionRequirements>;

    let result = 0n;
    for (const definition of Object.values(RolePermissionDefinitions)) {
        const value = calculateDenyPermission(
            definition.value,
            currentPermissions,
            cache
        );
        if (value) result |= BigInt(definition.value);
    }
    return result;
}

// ------

export function togglePermission(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    value: boolean
) {
    if (value) {
        return calculatePermissions(
            BigInt(currentPermissions) | BigInt(permission)
        );
    } else {
        return calculatePermissions(
            BigInt(currentPermissions) & ~BigInt(permission)
        );
    }
}

export function toggleDenyPermission(
    permission: RolePermissions,
    currentPermissions: string | number | bigint,
    value: boolean
) {
    if (value) {
        return calculateDenyPermissions(
            BigInt(currentPermissions) | BigInt(permission)
        );
    } else {
        return calculateDenyPermissions(
            BigInt(currentPermissions) & ~BigInt(permission)
        );
    }
}
