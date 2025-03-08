import { RolePermissions } from '../roles/enums';

export function isUserHasPermissions(
    user: any,
    ...permissions: (string | number | bigint)[]
) {
    if (!user) return false;

    if (user.root || user.getDataValue?.('root')) return true;

    const userPermissions = BigInt(user.permissions);

    if (userPermissions & BigInt(RolePermissions.Administrator)) return true;

    return permissions
        .filter(Boolean)
        .every((permission) => userPermissions & BigInt(permission));
}
