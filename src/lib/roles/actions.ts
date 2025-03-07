'use server';

import { RoleModel } from '@/database/sequelize';
import { RolePermissions } from './enums';
import {
    getIsLocalUserHasPermissions,
    getLocalUser,
} from '@/lib/users/actions';
import { Attributes } from 'sequelize';
import { Role } from '@/database/models/User.model';
import {
    actionError,
    actionResponse,
    type ActionResponse,
} from '../common/actionResponse';

export async function getAllRoles(): Promise<
    ActionResponse<Attributes<Role>[]>
> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) {
        return actionError.forbidden();
    }

    try {
        const roles = await RoleModel.findAll();
        return actionResponse(roles.map((role) => role.toJSON()));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getRoleById(
    id: number
): Promise<ActionResponse<Attributes<Role> | null>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) {
        return actionError.forbidden();
    }

    try {
        const role = await RoleModel.findByPk(id);
        return actionResponse(role ? role.toJSON() : null);
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function createRole(data: {
    name: string;
    color: number;
    permissions: string;
}): Promise<ActionResponse<Attributes<Role>>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) {
        return actionError.forbidden();
    }

    try {
        const role = await RoleModel.create(data, {
            fields: ['name', 'color', 'permissions'],
            returning: true,
        });
        return actionResponse(role.toJSON());
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateRole(
    id: number,
    data: {
        name: string;
        color: number;
        permissions: string;
    }
): Promise<ActionResponse<Attributes<Role>>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) {
        return actionError.forbidden();
    }

    try {
        const role = await RoleModel.findByPk(id);
        if (!role) {
            return actionError.notFound('Role not found');
        }
        await role.update(
            {
                name: data.name,
                color: data.color,
                permissions: data.permissions,
            },
            {
                returning: true,
                fields: ['name', 'color', 'permissions'],
                omitNull: true,
            }
        );
        return actionResponse(role.toJSON());
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
