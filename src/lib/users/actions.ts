'use server';

import { getOrRefreshAccessToken } from '../discord-oauth2/actions';
import { RoleModel, UserModel } from '@/database/sequelize';
import _ from 'lodash';
import { RolePermissions } from '../roles/enums';
import {
    actionError,
    actionResponse,
    type ActionResponse,
} from '../common/actionResponse';
import { Op } from 'sequelize';

// ---------

export async function getLocalUser(): Promise<ActionResponse<any>> {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData.success) return accessData;

    try {
        const user = await UserModel.findByPk(accessData.data.id, {
            include: [
                {
                    model: RoleModel,
                    attributes: {
                        exclude: [
                            'createdAt',
                            'updatedAt',
                            'deletedAt',
                            'deletable',
                            'editable',
                        ],
                    },
                },
            ],
            attributes: {
                exclude: [
                    'createdAt',
                    'updatedAt',
                    'deletedAt',
                    'bannedAt',
                    'discordUpdatedAt',
                ],
            },
        });
        if (!user) {
            return actionError.notFound('User not found');
        }

        return actionResponse(
            _.omit(user.get({ plain: true }), [
                'allowPermissionsOverride',
                'denyPermissionsOverride',
                'role.permissions',
            ])
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getIsLocalUserHasPermissions(
    ...permissions: (bigint | number | string)[]
): Promise<ActionResponse<boolean>> {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData.success) return accessData;

    try {
        const user = await UserModel.findByPk(accessData.data.id, {
            include: [
                {
                    model: RoleModel,
                    attributes: ['permissions'],
                },
            ],
            attributes: [
                'allowPermissionsOverride',
                'denyPermissionsOverride',
                'root',
            ],
        });
        if (!user || !user.hasPermissions(...permissions)) {
            return actionError.forbidden();
        }

        return actionResponse(true);
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getFullLocalUser(): Promise<ActionResponse<any>> {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData.success) return accessData;

    try {
        const user = await UserModel.findByPk(accessData.data.id, {
            include: [RoleModel],
        });
        if (!user) {
            return actionError.notFound('User not found');
        }

        return actionResponse(user.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getUsers(options?: {
    filter?: string;
    roles?: string[];
}): Promise<ActionResponse<any[]>> {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!permissionsResponse.success) return permissionsResponse;

    const where: any = {};
    if (options?.filter) {
        where[Op.or] = [
            {
                username: {
                    [Op.iLike]: `%${options.filter}%`,
                },
            },
            {
                displayName: {
                    [Op.iLike]: `%${options.filter}%`,
                },
            },
        ];
    }
    if (options?.roles?.length) {
        where.roleId = {
            [Op.in]: options.roles,
        };
    }

    try {
        const users = await UserModel.findAll({
            where,
            order: [['id', 'ASC']],
            include: [RoleModel],
        });
        return actionResponse(users.map((user) => user.get({ plain: true })));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getUser(id: string): Promise<ActionResponse<any>> {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const user = await UserModel.findByPk(id, {
            include: [RoleModel],
        });
        if (!user) {
            return actionError.notFound('User not found');
        }

        return actionResponse(user.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
