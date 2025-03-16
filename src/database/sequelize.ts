import 'server-only';

import type { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import pg from 'pg';

import { Config } from './models/Config.model';
import { Role, User } from './models/User.model';
import { RolePermissions } from '@/lib/roles/enums';
import { ConfigType } from '@/lib/configs/enums';

const sequelize = new Sequelize({
    dialect: process.env.DATABASE_DIALECT as Dialect,
    dialectModule: pg,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME,
    logging: false,
});

sequelize.addModels([User, Role, Config]);

await sequelize.sync().then(async () => {
    await Promise.all([
        Role.findOrCreate({
            where: {
                id: 0,
            },
            defaults: {
                name: 'Default',
                color: 0x000000,
                deletable: false,
                permissions:
                    RolePermissions.ViewSubmissions |
                    RolePermissions.CreateSubmissions |
                    RolePermissions.VoteForSubmissions |
                    RolePermissions.ViewSubmissionComments |
                    RolePermissions.CreateSubmissionComments |
                    RolePermissions.AttachFiles,
            },
            returning: false,
        }),
        Config.bulkCreate(
            [
                {
                    key: 'default_role_id',
                    value: '0',
                    type: ConfigType.Integer,
                    public: true,
                    deletable: false,
                },
            ],
            {
                ignoreDuplicates: true,
                returning: false,
            }
        ),
    ]);
});

export const UserModel = User;
export const RoleModel = Role;
export const ConfigModel = Config;
export default sequelize;
