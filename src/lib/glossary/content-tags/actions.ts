'use server';

import { ContentTagModel } from '@/database/sequelize';
import { RolePermissions } from '@/lib/roles/enums';
import { getIsLocalUserHasPermissions } from '@/lib/users/actions';
import { actionError, actionResponse } from '@/lib/common/actionResponse';
import { Op, UniqueConstraintError } from 'sequelize';

export async function getPublicContentTags(options?: { short?: boolean }) {
    let attributes: string[] = [
        'key',
        'name',
        'description',
        'format',
        'badgeColor',
        'badgeBgColor',
    ];
    if (options?.short) {
        attributes = ['key', 'name', 'badgeColor', 'badgeBgColor'];
    }

    try {
        const tags = await ContentTagModel.findAll({
            attributes,
        });

        return actionResponse(tags.map((tag) => tag.get({ plain: true })));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getPublicContentTag(key: string) {
    try {
        const tag = await ContentTagModel.findByPk(key, {
            attributes: [
                'key',
                'name',
                'description',
                'format',
                'badgeColor',
                'badgeBgColor',
            ],
        });
        if (!tag) {
            return actionError.notFound('Content tag not found');
        }
        return actionResponse(tag.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getContentTags(options?: { filter?: string }) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    const where: any = {};
    if (options?.filter) {
        where.name = {
            [Op.iLike]: `%${options.filter}%`,
        };
    }

    try {
        const tags = await ContentTagModel.findAll({
            where,
        });
        return actionResponse(tags.map((tag) => tag.get({ plain: true })));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getContentTag(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const tag = await ContentTagModel.findByPk(key);
        if (!tag) {
            return actionError.notFound('Content tag not found');
        }
        return actionResponse(tag.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function createContentTag(
    key: string,
    name: string,
    description: string,
    options?: {
        format?: string;
        badgeColor?: string;
        badgeBgColor?: string;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const newTag = await ContentTagModel.create({
            key,
            name,
            description,
            format: options?.format,
            badgeColor: options?.badgeColor,
            badgeBgColor: options?.badgeBgColor,
        });
        return actionResponse(newTag.get({ plain: true }));
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return actionError.badRequest('Content tag key already exists');
        }
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateContentTag(
    key: string,
    data: {
        name?: string;
        description?: string;
        format?: string;
        badgeColor?: string;
        badgeBgColor?: string;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const tag = await ContentTagModel.findByPk(key);
        if (!tag) return actionError.notFound('Content tag not found');
        await tag.update(data);
        return actionResponse(tag.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function deleteContentTag(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageGlossary
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const tag = await ContentTagModel.findByPk(key);
        if (!tag) return actionError.notFound('Content tag not found');
        await tag.destroy();
        return actionResponse({ success: true });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
