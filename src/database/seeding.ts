import 'server-only';

import { ConfigType } from './models/Config.model';
import sequelize, { RoleModel, ConfigModel } from './sequelize';
import { RolePermissions } from '@/lib/roles/enums';

export default async function seedDatabase() {
    console.log('Seeding database...');

    await sequelize.sync({ alter: true });

    await RoleModel.findOrCreate({
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
    });

    await ConfigModel.bulkCreate(
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
    );

    console.log('Database seeded successfully');
}
