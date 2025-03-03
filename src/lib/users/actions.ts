'use server';

import { getOrRefreshAccessToken } from '../discord-oauth2/actions';
import { RoleModel, UserModel } from '@/database/sequelize';
import _ from 'lodash';
import { RolePermissions } from '../roles/enums';
// ---------

export async function getLocalUser() {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData) return null;

    const user = await UserModel.findByPk(accessData.id, {
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
    if (!user) return null;

    return _.omit(user.get({ plain: true }), [
        'allowPermissionsOverride',
        'denyPermissionsOverride',
        'role.permissions',
    ]);
}

export async function getIsLocalUserHasPermissions(
    ...permissions: (bigint | number | string)[]
) {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData) return false;

    const user = await UserModel.findByPk(accessData.id, {
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
    if (!user || !user.hasPermissions(...permissions)) return false;
    return true;
}

export async function getFullLocalUser() {
    const accessData = await getOrRefreshAccessToken();
    if (!accessData) return null;

    const user = await UserModel.findByPk(accessData.id, {
        include: [RoleModel],
    });
    return user ? user.get({ plain: true }) : null;
}

// ---------

export async function getAllUsers() {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!allowed) throw new Error('Missing permissions');

    const users = await UserModel.findAll({
        include: [RoleModel],
    });
    return users.map((user) => user.get({ plain: true }));
}

export async function getUser(id: number) {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageUsers
    );
    if (!allowed) throw new Error('Missing permissions');

    const user = await UserModel.findByPk(id, {
        include: [RoleModel],
    });
    return user ? user.get({ plain: true }) : null;
}
