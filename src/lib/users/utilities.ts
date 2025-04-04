import { RolePermissions } from '../roles/enums';
import { calculatePermission } from '../roles/utilities';

export function isUserHasPermissions(
    user: any,
    ...permissions: (string | number | bigint)[]
) {
    if (!user) return false;
    if (user.root || user.getDataValue?.('root')) return true;

    const userPermissions = BigInt(user.permissions);
    if (userPermissions & BigInt(RolePermissions.Administrator)) return true;

    const cache = {} as any;
    return permissions.every((permission) =>
        calculatePermission(
            permission as RolePermissions,
            userPermissions,
            cache
        )
    );
}
