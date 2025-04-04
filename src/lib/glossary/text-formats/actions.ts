'use server';

import { TextFormatModel } from '@/database/sequelize';
import { RolePermissions } from '@/lib/roles/enums';
import { getIsLocalUserHasPermissions } from '@/lib/users/actions';
import { actionError, actionResponse } from '@/lib/common/actionResponse';
import { Op, UniqueConstraintError } from 'sequelize';

export async function getPublicTextFormats(options?: { short?: boolean }) {
    try {
        const formats = await TextFormatModel.findAll({
            attributes: ['key', 'pattern', 'replace', 'description'],
        });

        return actionResponse(
            formats.map((format) => format.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getPublicTextFormat(key: string) {
    try {
        const format = await TextFormatModel.findByPk(key, {
            attributes: ['key', 'pattern', 'replace', 'description'],
        });
        if (!format) {
            return actionError.notFound('Text format not found');
        }
        return actionResponse(format.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getTextFormats(options?: { filter?: string }) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    const where: any = {};
    if (options?.filter) {
        where.pattern = {
            [Op.iLike]: `%${options.filter}%`,
        };
    }

    try {
        const formats = await TextFormatModel.findAll({
            where,
        });
        return actionResponse(
            formats.map((format) => format.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getTextFormat(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const format = await TextFormatModel.findByPk(key);
        if (!format) {
            return actionError.notFound('Text format not found');
        }
        return actionResponse(format.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function createTextFormat(
    key: string,
    pattern: string,
    replace: string,
    description: string
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const newFormat = await TextFormatModel.create({
            key,
            pattern,
            replace,
            description,
        });
        return actionResponse(newFormat.get({ plain: true }));
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return actionError.badRequest('Text format key already exists');
        }
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateTextFormat(
    key: string,
    data: {
        pattern?: string;
        replace?: string;
        description?: string;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const format = await TextFormatModel.findByPk(key);
        if (!format) return actionError.notFound('Text format not found');
        await format.update(data);
        return actionResponse(format.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function deleteTextFormat(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const format = await TextFormatModel.findByPk(key);
        if (!format) return actionError.notFound('Text format not found');
        await format.destroy();
        return actionResponse({ success: true });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
