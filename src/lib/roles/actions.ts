'use server';

import { RoleModel } from '@/database/sequelize';
import { getLocalUser } from '@/lib/users/actions';

export async function getAllRoles() {
    const localUser = await getLocalUser();
    if (!localUser) {
        throw new Error('Unauthorized');
    }
    const roles = await RoleModel.findAll();
    return roles.map((role) => role.toJSON());
}

export async function getRoleById(id: number) {
    const localUser = await getLocalUser();
    if (!localUser) {
        throw new Error('Unauthorized');
    }
    const role = await RoleModel.findByPk(id);
    return role ? role.toJSON() : null;
}

export async function createRole(name: string, color: number) {
    const role = await RoleModel.create({ name, color });
    return role.toJSON();
}
