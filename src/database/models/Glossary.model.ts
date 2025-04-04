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

@Table({
    modelName: 'Keyword',
    tableName: 'keywords',
    timestamps: true,
})
export class Keyword extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    key: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    phrase: string;

    @AllowNull(false)
    @Column(DataType.ARRAY(DataType.STRING))
    @Default([])
    synonyms: string[];

    @AllowNull(false)
    @Column(DataType.STRING)
    description: string;

    @CreatedAt
    createdAt: Date;
    @UpdatedAt
    updatedAt: Date;
}

@Table({
    modelName: 'MechanicKeyword',
    tableName: 'mechanic_keywords',
    timestamps: true,
})
export class MechanicKeyword extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    key: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    description: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    format?: string;

    @AllowNull(false)
    @Column(DataType.ARRAY(DataType.STRING))
    @Default([])
    defaultVars: string[];

    @AllowNull(false)
    @Column(DataType.STRING)
    @Default('#000000')
    badgeColor: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    @Default('#ffffff')
    badgeBgColor: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

@Table({
    modelName: 'ContentTag',
    tableName: 'content_tags',
    timestamps: true,
})
export class ContentTag extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    key: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    description: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    format: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    badgeColor: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    badgeBgColor: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

@Table({
    modelName: 'TextFormat',
    tableName: 'text_formats',
    timestamps: true,
})
export class TextFormat extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    key: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    pattern: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    replace: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    description: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
