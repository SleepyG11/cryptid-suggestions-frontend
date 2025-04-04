'use server';

import { MechanicKeywordModel } from '@/database/sequelize';
import { RolePermissions } from '@/lib/roles/enums';
import { getIsLocalUserHasPermissions } from '@/lib/users/actions';
import { actionError, actionResponse } from '@/lib/common/actionResponse';
import { Op, UniqueConstraintError } from 'sequelize';

export async function getPublicMechanicKeywords(options?: { short?: boolean }) {
    let attributes: string[] = [
        'key',
        'name',
        'description',
        'format',
        'defaultVars',
        'badgeColor',
        'badgeBgColor',
    ];
    if (options?.short) {
        attributes = ['key', 'name', 'badgeColor', 'badgeBgColor'];
    }

    try {
        const keywords = await MechanicKeywordModel.findAll({
            attributes,
        });

        return actionResponse(
            keywords.map((keyword) => keyword.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getPublicMechanicKeyword(key: string) {
    try {
        const keyword = await MechanicKeywordModel.findByPk(key, {
            attributes: [
                'key',
                'name',
                'description',
                'format',
                'defaultVars',
                'badgeColor',
                'badgeBgColor',
            ],
        });
        if (!keyword) {
            return actionError.notFound('Keyword not found');
        }
        return actionResponse(keyword.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getMechanicKeywords(options?: { filter?: string }) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    const where: any = {};
    if (options?.filter) {
        where.phrase = {
            [Op.iLike]: `%${options.filter}%`,
        };
    }

    try {
        const keywords = await MechanicKeywordModel.findAll({
            where,
        });
        return actionResponse(
            keywords.map((keyword) => keyword.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getMechanicKeyword(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await MechanicKeywordModel.findByPk(key);
        if (!keyword) {
            return actionError.notFound('Keyword not found');
        }
        return actionResponse(keyword.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function createMechanicKeyword(
    key: string,
    name: string,
    description: string,
    options?: {
        format?: string;
        defaultVars?: string[];
        badgeColor?: string;
        badgeBgColor?: string;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const newKeyword = await MechanicKeywordModel.create({
            key,
            name,
            description,
            format: options?.format,
            defaultVars: options?.defaultVars,
            badgeColor: options?.badgeColor,
            badgeBgColor: options?.badgeBgColor,
        });
        return actionResponse(newKeyword.get({ plain: true }));
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return actionError.badRequest('Keyword key already exists');
        }
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateMechanicKeyword(
    key: string,
    data: {
        name?: string;
        description?: string;
        format?: string;
        defaultVars?: string[];
        badgeColor?: string;
        badgeBgColor?: string;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await MechanicKeywordModel.findByPk(key);
        if (!keyword) return actionError.notFound('Keyword not found');
        await keyword.update(data);
        return actionResponse(keyword.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function deleteMechanicKeyword(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await MechanicKeywordModel.findByPk(key);
        if (!keyword) return actionError.notFound('Keyword not found');
        await keyword.destroy();
        return actionResponse({ success: true });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
