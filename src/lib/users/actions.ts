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
        return actionError.databaseError();
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
                    attributes: {
                        include: ['permissions'],
                    },
                },
            ],
            attributes: {
                include: [
                    'allowPermissionsOverride',
                    'denyPermissionsOverride',
                    'root',
                ],
            },
        });
        if (!user || !user.hasPermissions(...permissions)) {
            return actionError.forbidden();
        }

        return actionResponse(true);
    } catch (error) {
        console.error(error);
        return actionError.databaseError();
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
        return actionError.databaseError();
    }
}

// ---------

export async function getAllUsers(): Promise<ActionResponse<any[]>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!allowed.success) return allowed;

    try {
        const users = await UserModel.findAll({
            include: [RoleModel],
        });
        return actionResponse(users.map((user) => user.get({ plain: true })));
    } catch (error) {
        console.error(error);
        return actionError.databaseError();
    }
}

export async function getUser(id: number): Promise<ActionResponse<any>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!allowed.success) return allowed;

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
        return actionError.databaseError();
    }
}
