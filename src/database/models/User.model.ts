import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    BelongsTo,
    ForeignKey,
    AutoIncrement,
    HasMany,
    AllowNull,
    Default,
} from 'sequelize-typescript';
import { ConfigModel } from '../sequelize';

@Table({
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
})
export class Role extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    color: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.BIGINT)
    permissions: number;

    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    editable: boolean;

    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    deletable: boolean;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    order: number;

    @HasMany(() => User)
    users: User[];

    @Column({
        type: DataType.VIRTUAL,
        get() {
            return `#${this.getDataValue('color').toString(16).padStart(6, '0')}`;
        },
    })
    hexColor: string;
}

@Table({
    tableName: 'users',
    timestamps: true,
    paranoid: true,
})
export class User extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING,
    })
    id: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    username: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    displayName: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    avatar: string;

    @Column(DataType.STRING)
    decoration: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    discordUpdatedAt: Date;

    @BelongsTo(() => Role)
    declare role: Role;
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER)
    roleId: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.BIGINT)
    allowPermissionsOverride: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.BIGINT)
    denyPermissionsOverride: number;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    root: boolean;

    @AllowNull(true)
    @Column(DataType.DATE)
    bannedAt: Date;
    @CreatedAt
    createdAt: Date;
    @UpdatedAt
    updatedAt: Date;
    @DeletedAt
    deletedAt: Date;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            const role = this.getDataValue('role');
            if (!role) return null;

            const allowPermissions = this.getDataValue(
                'allowPermissionsOverride'
            );
            const denyPermissions = this.getDataValue(
                'denyPermissionsOverride'
            );

            if (allowPermissions == null || denyPermissions == null)
                return null;

            return (
                (BigInt(role.permissions) | BigInt(allowPermissions)) &
                ~BigInt(denyPermissions)
            ).toString();
        },
    })
    permissions: string;

    static async fromDiscordUser(user: any) {
        const defaultRoleId = await ConfigModel.findByPk('default_role_id');

        return this.upsert(
            {
                id: user.id,
                username: user.username,
                displayName: user.global_name,
                avatar: user.avatar,
                decoration: user?.avatar_decoration_data?.asset,
                discordUpdatedAt: new Date(),
                roleId: defaultRoleId?.parsedValue ?? 0,
            },
            {
                returning: true,
            }
        );
    }
}
