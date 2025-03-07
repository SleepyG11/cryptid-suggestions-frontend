'use server';

import { RoleModel } from '@/database/sequelize';
import { RolePermissions } from './enums';
import {
    getIsLocalUserHasPermissions,
    getLocalUser,
} from '@/lib/users/actions';
import { Attributes, Op } from 'sequelize';
import { Role } from '@/database/models/User.model';
import {
    actionError,
    actionResponse,
    type ActionResponse,
} from '../common/actionResponse';

// ---------

export async function getPublicRoles(): Promise<
    ActionResponse<Attributes<Role>[]>
> {
    try {
        const roles = await RoleModel.findAll({
            include: ['id', 'name', 'color', 'order'],
            order: [
                ['order', 'DESC'],
                ['id', 'ASC'],
            ],
        });
        return actionResponse(roles.map((role) => role.toJSON()));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getRoles(options?: {
    filter?: string;
}): Promise<ActionResponse<Attributes<Role>[]>> {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

    const where: any = {};
    if (options?.filter) {
        where.name = {
            [Op.like]: `%${options.filter}%`,
        };
    }

    try {
        const roles = await RoleModel.findAll({
            where,
            order: [
                ['order', 'DESC'],
                ['id', 'ASC'],
            ],
        });
        return actionResponse(roles.map((role) => role.toJSON()));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getRoleById(
    id: number
): Promise<ActionResponse<Attributes<Role> | null>> {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

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
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

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
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

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

// ---------
