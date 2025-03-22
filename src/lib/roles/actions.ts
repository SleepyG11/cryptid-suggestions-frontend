'use server';

import sequelize, { RoleModel, UserModel } from '@/database/sequelize';
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
            attributes: ['id', 'name', 'color', 'order'],
            order: [
                ['order', 'DESC'],
                ['id', 'ASC'],
            ],
        });
        return actionResponse(roles.map((role) => role.get({ plain: true })));
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
            [Op.iLike]: `%${options.filter}%`,
        };
    }

    try {
        const roles = await RoleModel.findAll({
            where,
            include: [
                {
                    model: UserModel,
                    as: 'users',
                    attributes: [],
                },
            ],
            attributes: {
                include: [
                    [
                        sequelize.fn('COUNT', sequelize.col('users.id')),
                        'usersCount',
                    ],
                ],
            },
            group: ['Role.id'],
            order: [
                ['order', 'ASC'],
                ['id', 'ASC'],
            ],
        });
        return actionResponse(roles.map((role) => role.get({ plain: true })));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getRoleById(
    id: string
): Promise<ActionResponse<Attributes<Role> | null>> {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const role = await RoleModel.findByPk(id);
        return actionResponse(role ? role.get({ plain: true }) : null);
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
        return actionResponse(role.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateRole(
    id: string,
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
        return actionResponse(role.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateRolesOrder(roles: { id: string; order: number }[]) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        await sequelize.transaction(async (transaction) => {
            await Promise.all(
                roles.map((role) => {
                    return RoleModel.update(
                        { order: role.order },
                        { where: { id: role.id }, transaction }
                    );
                })
            );
        });
        return actionResponse(true);
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------
