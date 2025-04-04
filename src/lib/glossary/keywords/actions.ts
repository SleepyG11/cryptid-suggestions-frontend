'use server';

import { KeywordModel } from '@/database/sequelize';
import { RolePermissions } from '@/lib/roles/enums';
import { getIsLocalUserHasPermissions } from '@/lib/users/actions';
import { actionError, actionResponse } from '@/lib/common/actionResponse';
import { Op, UniqueConstraintError } from 'sequelize';

export async function getPublicKeywords(options?: { short?: boolean }) {
    let attributes: string[] = ['key', 'phrase', 'synonyms', 'description'];
    if (options?.short) {
        attributes = ['key', 'phrase', 'synonyms'];
    }

    try {
        const keywords = await KeywordModel.findAll({
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

export async function getPublicKeyword(key: string) {
    try {
        const keyword = await KeywordModel.findByPk(key, {
            attributes: ['key', 'phrase', 'synonyms', 'description'],
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

export async function getKeywords(options?: { filter?: string }) {
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
        const keywords = await KeywordModel.findAll({
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

export async function getKeyword(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await KeywordModel.findByPk(key);
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

export async function createKeyword(
    key: string,
    phrase: string,
    description: string,
    options?: {
        synonyms?: string[];
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const newKeyword = await KeywordModel.create({
            key,
            phrase,
            description,
            synonyms: options?.synonyms,
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

export async function updateKeyword(
    key: string,
    data: {
        phrase?: string;
        description?: string;
        synonyms?: string[];
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await KeywordModel.findByPk(key);
        if (!keyword) return actionError.notFound('Keyword not found');
        await keyword.update(data);
        return actionResponse(keyword.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function deleteKeyword(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const keyword = await KeywordModel.findByPk(key);
        if (!keyword) return actionError.notFound('Keyword not found');
        await keyword.destroy();
        return actionResponse({ success: true });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
