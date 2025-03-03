'use server';

import { RoleModel } from '@/database/sequelize';
import { RolePermissions } from './enums';
import {
    getIsLocalUserHasPermissions,
    getLocalUser,
} from '@/lib/users/actions';
import { Attributes } from 'sequelize';
import { Role } from '@/database/models/User.model';

export async function getAllRoles(): Promise<Attributes<Role>[]> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) throw new Error('Missing permissions');

    const roles = await RoleModel.findAll();
    return roles.map((role) => role.toJSON());
}

export async function getRoleById(
    id: number
): Promise<Attributes<Role> | null> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) throw new Error('Missing permissions');

    const role = await RoleModel.findByPk(id);
    return role ? role.toJSON() : null;
}

export async function createRole(data: {
    name: string;
    color: number;
    permissions: string;
}): Promise<Attributes<Role>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) throw new Error('Missing permissions');

    const role = await RoleModel.create(data, {
        fields: ['name', 'color', 'permissions'],
        returning: true,
    });
    return role.toJSON();
}

export async function updateRole(
    id: number,
    data: {
        name: string;
        color: number;
        permissions: string;
    }
): Promise<Attributes<Role>> {
    const allowed = await getIsLocalUserHasPermissions(
        RolePermissions.ManageRoles
    );
    if (!allowed) throw new Error('Missing permissions');

    const role = await RoleModel.findByPk(id);
    if (!role) {
        throw new Error('Role not found');
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
    return role.toJSON();
}
