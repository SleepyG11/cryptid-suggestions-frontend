'use server';

import Database, { ConfigModel } from '@/database/sequelize';
import { actionResponse, actionError } from '../common/actionResponse';
import { RolePermissions } from '../roles/enums';
import { getIsLocalUserHasPermissions } from '../users/actions';
import { Op, UniqueConstraintError } from 'sequelize';
import { ConfigType } from './enums';

// ---------

export async function getPublicConfigs() {
    try {
        const configs = await ConfigModel.findAll({
            attributes: ['key', 'value', 'type'],
            where: { public: true },
            order: [['key', 'ASC']],
        });
        return actionResponse(
            configs.map((config) => config.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getPublicConfig(key: string) {
    try {
        const config = await ConfigModel.findOne({
            where: { key, public: true },
        });
        return actionResponse(config?.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function getConfigs() {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const configs = await ConfigModel.findAll();
        return actionResponse(
            configs.map((config) => config.get({ plain: true }))
        );
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function getConfig(key: string) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const config = await ConfigModel.findOne({ where: { key } });
        return actionResponse(config?.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function createConfig(
    key: string,
    type: ConfigType,
    value: any,
    options?: {
        editable?: boolean;
        deletable?: boolean;
        public?: boolean;
    }
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    if (!Object.values(ConfigType).includes(type)) {
        return actionError.badRequest('Invalid config type');
    }

    try {
        const config = await ConfigModel.create(
            {
                key,
                type,
                value,
                editable: options?.editable ?? true,
                deletable: options?.deletable ?? true,
                public: options?.public ?? false,
            },
            {
                returning: true,
            }
        );
        return actionResponse(config.get({ plain: true }));
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return actionError.badRequest('Config key already exists');
        }
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function updateConfig(
    key: string,
    value: any,
    bypassEditable: boolean = false
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const config = await ConfigModel.findByPk(key);
        if (!config) return actionError.notFound('Config not found');
        if (!bypassEditable && !config.editable) {
            return actionError.badRequest('Config is not editable');
        }
        config.set('parsedValue', value);
        await config.save();
        return actionResponse(config.get({ plain: true }));
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function deleteConfig(
    key: string,
    bypassDeletable: boolean = false
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const config = await ConfigModel.findByPk(key);
        if (!config) return actionError.notFound('Config not found');
        if (!bypassDeletable && !config.deletable) {
            return actionError.badRequest('Config is not deletable');
        }
        await config.destroy();
        return actionResponse(true);
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

// ---------

export async function bulkUpdateConfigs(
    updateData: {
        key: string;
        value: any;
    }[]
) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const result = await Database.transaction(async (transaction) => {
            return Promise.all(
                updateData.map(async (update) => {
                    const config = await ConfigModel.findByPk(update.key, {
                        attributes: ['editable', 'type', 'value', 'key'],
                        transaction,
                    });
                    if (!config || !config.editable) return false;
                    config.set('parsedValue', update.value);
                    await config.save({ transaction });
                    return true;
                })
            );
        });
        return actionResponse({
            updated: result.filter(Boolean).length,
        });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}

export async function bulkDeleteConfigs(keys: string[]) {
    const permissionsResponse = await getIsLocalUserHasPermissions(
        RolePermissions.ManageConfigs
    );
    if (!permissionsResponse.success) return permissionsResponse;

    try {
        const result = await ConfigModel.destroy({
            where: { key: { [Op.in]: keys, deletable: true } },
        });
        return actionResponse({
            deleted: result,
        });
    } catch (error) {
        console.error(error);
        return actionError.databaseError(error);
    }
}
