import 'server-only';

import {
    Model,
    Table,
    Column,
    DataType,
    PrimaryKey,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    Default,
} from 'sequelize-typescript';

export enum ConfigType {
    String = 'string',
    Integer = 'integer',
    Float = 'float',
    Boolean = 'boolean',
    Date = 'date',
}

@Table({
    tableName: 'configs',
    timestamps: true,
})
export class Config extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    key: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(ConfigType)))
    type: ConfigType;

    @AllowNull(false)
    @Column(DataType.STRING)
    value: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    public: boolean;

    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    deletable: boolean;

    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    editable: boolean;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            const rawValue = this.getDataValue('value');
            if (rawValue === null) return null;
            switch (this.getDataValue('type')) {
                case ConfigType.String:
                    return rawValue;
                case ConfigType.Integer:
                    return parseInt(rawValue);
                case ConfigType.Float:
                    return parseFloat(rawValue);
                case ConfigType.Boolean:
                    return rawValue === 'true';
                case ConfigType.Date:
                    return new Date(rawValue);
                default:
                    return rawValue;
            }
        },
    })
    parsedValue: any;
}
