export enum RolePermissions {
    // Admin

    /** ALL permissions, overrides all other permissions */
    Administrator = 2 ** 0,
    /** View site logs */
    ViewLogs = 2 ** 1,
    /** Manage global site configs */
    ManageConfigs = 2 ** 2,

    // Internal

    /** Manage webhooks */
    ManageWebhooks = 2 ** 3,
    /** View, add, edit and delete roles */
    ManageRoles = 2 ** 4,
    /** View, add, edit and delete pages */
    ManagePages = 2 ** 5,
    /** Manage glossary */
    ManageGlossary = 2 ** 6,

    // Users

    /** View public users list */
    ViewUsers = 2 ** 7,
    /** Manage users registered on the site */
    ManageUsers = 2 ** 8,
    /** Manage user roles and permissions */
    ManageUserRolesAndPermissions = 2 ** 9,
    /** Ban/unban users */
    ModerateUsers = 2 ** 10,

    // Submissions: public

    /** View public submissions and update events */
    ViewSubmissions = 2 ** 11,
    /** Vote for submissions */
    VoteForSubmissions = 2 ** 12,
    /** View submission changes history */
    ViewSubmissionHistory = 2 ** 13,
    /** View other users submission history */
    ViewOtherSubmissionHistory = 2 ** 14,
    /** Assign self as a "developer" to a submission */
    AssignSelfToSubmission = 2 ** 15,

    /** Create own submissions */
    CreateSubmissions = 2 ** 16,
    /** Edit own submissions */
    EditSubmissions = 2 ** 17,
    /** Mark own submission as "deleted" */
    DeleteSubmissions = 2 ** 18,

    // Submissions: admin

    /** View ALL submissions */
    ManageSubmissions = 2 ** 19,
    /** Check new submissions and edits for content violations */
    ModerateSubmissions = 2 ** 20,
    /** Change submissions status */
    ManageSubmissionStatus = 2 ** 21,
    /** Assign any user as a "developer" to a submission */
    AssignOtherToSubmission = 2 ** 22,

    // Submissions comments: public

    /** View public submission comments */
    ViewSubmissionComments = 2 ** 23,
    /** Create public submission comments */
    CreateSubmissionComments = 2 ** 24,
    /** Edit own submission comments */
    EditSubmissionComments = 2 ** 25,
    /** Mark own submission comments as "deleted" */
    DeleteSubmissionComments = 2 ** 26,
    /** Attach files to submission comments */
    AttachFilesToSubmissionComments = 2 ** 27,

    // Submissions comments: admin

    /** Manage submission comments */
    ManageSubmissionComments = 2 ** 28,
    /** Edit any submission comment */
    EditAnySubmissionComment = 2 ** 29,
    /** Delete any submission comment */
    DeleteAnySubmissionComment = 2 ** 30,
    /** Check new submission comments and edits for content violations */
    ModerateSubmissionComments = 2 ** 31,

    // Submission admin comments

    /** View submission admin comments */
    ViewSubmissionAdminComments = 2 ** 32,
    /** Create submission admin comments */
    CreateSubmissionAdminComments = 2 ** 33,
    /** Edit own submission admin comment */
    EditSubmissionAdminComment = 2 ** 34,
    /** Delete own submission admin comment */
    DeleteSubmissionAdminComment = 2 ** 35,
}

export type RolePermissionDefinition = {
    key: string;
    name: string;
    description: string;
    value: RolePermissions;
    /** Permissions that must be present for this permission to be active */
    required: RolePermissions[];
    /** This permission will be active if the following permission is active. Overrides requirements */
    follows: RolePermissions | null;
};

export const RolePermissionDefinitions: Record<
    RolePermissions,
    RolePermissionDefinition
> = {
    [RolePermissions.Administrator]: {
        key: 'Administrator',
        name: 'Administrator',
        description: 'Gives all permissions',
        value: RolePermissions.Administrator,
        required: [],
        follows: null,
    },
    [RolePermissions.ViewLogs]: {
        key: 'ViewLogs',
        name: 'View Logs',
        description: 'View all system logs',
        value: RolePermissions.ViewLogs,
        required: [],
        follows: null,
    },
    [RolePermissions.ManageConfigs]: {
        key: 'ManageConfigs',
        name: 'Manage Configs',
        description: 'Manage global site configs',
        value: RolePermissions.ManageConfigs,
        required: [],
        follows: null,
    },

    [RolePermissions.ManageWebhooks]: {
        key: 'ManageWebhooks',
        name: 'Manage Webhooks',
        description: 'Manage webhooks',
        value: RolePermissions.ManageWebhooks,
        required: [],
        follows: null,
    },
    [RolePermissions.ManageRoles]: {
        key: 'ManageRoles',
        name: 'Manage Roles',
        description: 'Manage roles',
        value: RolePermissions.ManageRoles,
        required: [],
        follows: null,
    },
    [RolePermissions.ManagePages]: {
        key: 'ManagePages',
        name: 'Manage Pages',
        description: 'Manage content pages',
        value: RolePermissions.ManagePages,
        required: [],
        follows: null,
    },
    [RolePermissions.ManageGlossary]: {
        key: 'ManageGlossary',
        name: 'Manage Glossary',
        description: 'Manage glossary',
        value: RolePermissions.ManageGlossary,
        required: [],
        follows: null,
    },

    [RolePermissions.ViewUsers]: {
        key: 'ViewUsers',
        name: 'View Users',
        description: 'View public users list',
        value: RolePermissions.ViewUsers,
        required: [],
        follows: RolePermissions.ManageUsers,
    },
    [RolePermissions.ManageUsers]: {
        key: 'ManageUsers',
        name: 'Manage Users',
        description: 'View all users registered on the site',
        value: RolePermissions.ManageUsers,
        required: [],
        follows: null,
    },
    [RolePermissions.ManageUserRolesAndPermissions]: {
        key: 'ManageUserRolesAndPermissions',
        name: 'Manage User Roles and Permissions',
        description: 'Manage user roles and permissions',
        value: RolePermissions.ManageUserRolesAndPermissions,
        required: [RolePermissions.ManageUsers],
        follows: null,
    },
    [RolePermissions.ModerateUsers]: {
        key: 'ModerateUsers',
        name: 'Moderate Users',
        description: 'Ban/unban users',
        value: RolePermissions.ModerateUsers,
        required: [
            RolePermissions.ManageUsers,
            RolePermissions.ManageUserRolesAndPermissions,
        ],
        follows: null,
    },

    [RolePermissions.ViewSubmissions]: {
        key: 'ViewSubmissions',
        name: 'View Submissions',
        description: 'View public submissions',
        value: RolePermissions.ViewSubmissions,
        required: [],
        follows: RolePermissions.ManageSubmissions,
    },
    [RolePermissions.VoteForSubmissions]: {
        key: 'VoteForSubmissions',
        name: 'Vote for Submissions',
        description: 'Vote for submissions',
        value: RolePermissions.VoteForSubmissions,
        required: [RolePermissions.ViewSubmissions],
        follows: null,
    },
    [RolePermissions.ViewSubmissionHistory]: {
        key: 'ViewSubmissionHistory',
        name: 'View Submission History',
        description: 'View submission history',
        value: RolePermissions.ViewSubmissionHistory,
        required: [RolePermissions.ViewSubmissions],
        follows: RolePermissions.ManageSubmissions,
    },
    [RolePermissions.ViewOtherSubmissionHistory]: {
        key: 'ViewOtherSubmissionHistory',
        name: 'View Other Submission History',
        description: 'View other users submission history',
        value: RolePermissions.ViewOtherSubmissionHistory,
        required: [RolePermissions.ViewSubmissions],
        follows: RolePermissions.ManageSubmissions,
    },
    [RolePermissions.AssignSelfToSubmission]: {
        key: 'AssignSelfToSubmission',
        name: 'Assign Self to Submission',
        description: 'Assign self to a submission',
        value: RolePermissions.AssignSelfToSubmission,
        required: [RolePermissions.ViewSubmissions],
        follows: null,
    },

    [RolePermissions.CreateSubmissions]: {
        key: 'CreateSubmissions',
        name: 'Create Submissions',
        description: 'Create new submissions',
        value: RolePermissions.CreateSubmissions,
        required: [],
        follows: null,
    },
    [RolePermissions.EditSubmissions]: {
        key: 'EditSubmissions',
        name: 'Edit Submissions',
        description: 'Edit own submissions',
        value: RolePermissions.EditSubmissions,
        required: [RolePermissions.CreateSubmissions],
        follows: null,
    },
    [RolePermissions.DeleteSubmissions]: {
        key: 'DeleteSubmissions',
        name: 'Delete Submissions',
        description: 'Delete own submissions',
        value: RolePermissions.DeleteSubmissions,
        required: [RolePermissions.CreateSubmissions],
        follows: null,
    },

    [RolePermissions.ManageSubmissions]: {
        key: 'ManageSubmissions',
        name: 'Manage Submissions',
        description: 'Manage submissions',
        value: RolePermissions.ManageSubmissions,
        required: [],
        follows: null,
    },
    [RolePermissions.ModerateSubmissions]: {
        key: 'ModerateSubmissions',
        name: 'Moderate Submissions',
        description: 'Moderate submissions',
        value: RolePermissions.ModerateSubmissions,
        required: [RolePermissions.ManageSubmissions],
        follows: null,
    },
    [RolePermissions.ManageSubmissionStatus]: {
        key: 'ManageSubmissionStatus',
        name: 'Manage Submission Status',
        description: 'Manage submission status',
        value: RolePermissions.ManageSubmissionStatus,
        required: [RolePermissions.ManageSubmissions],
        follows: null,
    },

    [RolePermissions.AssignOtherToSubmission]: {
        key: 'AssignOtherToSubmission',
        name: 'Assign Other to Submission',
        description: 'Assign other user to a submission',
        value: RolePermissions.AssignOtherToSubmission,
        required: [RolePermissions.ManageSubmissions],
        follows: null,
    },

    [RolePermissions.ViewSubmissionComments]: {
        key: 'ViewSubmissionComments',
        name: 'View Submission Comments',
        description: 'View submission comments',
        value: RolePermissions.ViewSubmissionComments,
        required: [RolePermissions.ViewSubmissions],
        follows: RolePermissions.ManageSubmissionComments,
    },
    [RolePermissions.CreateSubmissionComments]: {
        key: 'CreateSubmissionComments',
        name: 'Create Submission Comments',
        description: 'Create submission comments',
        value: RolePermissions.CreateSubmissionComments,
        required: [RolePermissions.ViewSubmissionComments],
        follows: null,
    },
    [RolePermissions.EditSubmissionComments]: {
        key: 'EditSubmissionComments',
        name: 'Edit Submission Comments',
        description: 'Edit submission comments',
        value: RolePermissions.EditSubmissionComments,
        required: [RolePermissions.ViewSubmissionComments],
        follows: null,
    },
    [RolePermissions.DeleteSubmissionComments]: {
        key: 'DeleteSubmissionComments',
        name: 'Delete Submission Comments',
        description: 'Delete submission comments',
        value: RolePermissions.DeleteSubmissionComments,
        required: [RolePermissions.ViewSubmissionComments],
        follows: null,
    },
    [RolePermissions.AttachFilesToSubmissionComments]: {
        key: 'AttachFilesToSubmissionComments',
        name: 'Attach Files to Submission Comments',
        description: 'Attach files to submission comments',
        value: RolePermissions.AttachFilesToSubmissionComments,
        required: [],
        follows: null,
    },

    [RolePermissions.ManageSubmissionComments]: {
        key: 'ManageSubmissionComments',
        name: 'Manage Submission Comments',
        description: 'Manage submission comments',
        value: RolePermissions.ManageSubmissionComments,
        required: [],
        follows: null,
    },
    [RolePermissions.EditAnySubmissionComment]: {
        key: 'EditAnySubmissionComment',
        name: 'Edit Any Submission Comment',
        description: 'Edit any submission comment',
        value: RolePermissions.EditAnySubmissionComment,
        required: [RolePermissions.ManageSubmissionComments],
        follows: null,
    },
    [RolePermissions.DeleteAnySubmissionComment]: {
        key: 'DeleteAnySubmissionComment',
        name: 'Delete Any Submission Comment',
        description: 'Delete any submission comment',
        value: RolePermissions.DeleteAnySubmissionComment,
        required: [RolePermissions.ManageSubmissionComments],
        follows: null,
    },
    [RolePermissions.ModerateSubmissionComments]: {
        key: 'ModerateSubmissionComments',
        name: 'Moderate Submission Comments',
        description:
            'Check new submission comments and edits for content violations',
        value: RolePermissions.ModerateSubmissionComments,
        required: [RolePermissions.ManageSubmissionComments],
        follows: null,
    },

    [RolePermissions.ViewSubmissionAdminComments]: {
        key: 'ViewSubmissionAdminComments',
        name: 'View Submission Admin Comments',
        description: 'View submission admin comments',
        value: RolePermissions.ViewSubmissionAdminComments,
        required: [],
        follows: null,
    },
    [RolePermissions.CreateSubmissionAdminComments]: {
        key: 'CreateSubmissionAdminComments',
        name: 'Create Submission Admin Comments',
        description: 'Create submission admin comments',
        value: RolePermissions.CreateSubmissionAdminComments,
        required: [RolePermissions.ViewSubmissionAdminComments],
        follows: null,
    },
    [RolePermissions.EditSubmissionAdminComment]: {
        key: 'EditSubmissionAdminComment',
        name: 'Edit Submission Admin Comment',
        description: 'Edit submission admin comment',
        value: RolePermissions.EditSubmissionAdminComment,
        required: [RolePermissions.ViewSubmissionAdminComments],
        follows: null,
    },
    [RolePermissions.DeleteSubmissionAdminComment]: {
        key: 'DeleteSubmissionAdminComment',
        name: 'Delete Submission Admin Comment',
        description: 'Delete submission admin comment',
        value: RolePermissions.DeleteSubmissionAdminComment,
        required: [RolePermissions.ViewSubmissionAdminComments],
        follows: null,
    },
};

export type RolePermissionGroup = {
    key: string;
    name: string;
    description: string;
    permissions: RolePermissions[];
};

export const RolePermissionGroups: Record<string, RolePermissionGroup> = {
    Administration: {
        key: 'Administration',
        name: 'Administration',
        description: 'Global site permissions',
        permissions: [
            RolePermissions.Administrator,
            RolePermissions.ViewLogs,
            RolePermissions.ManageConfigs,
        ],
    },
    Internal: {
        key: 'Internal',
        name: 'Internal',
        description: "Internal site system's permissions",
        permissions: [
            RolePermissions.ManageWebhooks,
            RolePermissions.ManageRoles,
            RolePermissions.ManagePages,
            RolePermissions.ManageGlossary,
        ],
    },
    Moderation: {
        key: 'Moderation',
        name: 'Moderation',
        description: 'User content moderation permissions',
        permissions: [
            RolePermissions.ModerateUsers,
            RolePermissions.ModerateSubmissions,
            RolePermissions.ModerateSubmissionComments,
        ],
    },
    Users: {
        key: 'Users',
        name: 'Users',
        description: 'Users permissions',
        permissions: [
            RolePermissions.ViewUsers,
            RolePermissions.ManageUsers,
            RolePermissions.ManageUserRolesAndPermissions,
            RolePermissions.ModerateUsers,
        ],
    },
    Submissions: {
        key: 'Submissions',
        name: 'Submissions',
        description: 'Submissions permissions',
        permissions: [
            RolePermissions.ViewSubmissions,
            RolePermissions.VoteForSubmissions,
            RolePermissions.ViewSubmissionHistory,
            RolePermissions.ViewOtherSubmissionHistory,
            RolePermissions.AssignSelfToSubmission,
            RolePermissions.CreateSubmissions,
            RolePermissions.EditSubmissions,
            RolePermissions.DeleteSubmissions,
        ],
    },
    ManageSubmissions: {
        key: 'ManageSubmissions',
        name: 'Manage Submissions',
        description: 'Submissions admin permissions',
        permissions: [
            RolePermissions.ManageSubmissions,
            RolePermissions.ModerateSubmissions,
            RolePermissions.ManageSubmissionStatus,
            RolePermissions.AssignOtherToSubmission,
        ],
    },
    SubmissionComments: {
        key: 'SubmissionComments',
        name: 'Submission Comments',
        description: 'Submission comments permissions',
        permissions: [
            RolePermissions.ViewSubmissionComments,
            RolePermissions.CreateSubmissionComments,
            RolePermissions.EditSubmissionComments,
            RolePermissions.DeleteSubmissionComments,
            RolePermissions.AttachFilesToSubmissionComments,
        ],
    },
    ManageSubmissionComments: {
        key: 'ManageSubmissionComments',
        name: 'Manage Submission Comments',
        description: 'Manage submission comments',
        permissions: [
            RolePermissions.ManageSubmissionComments,
            RolePermissions.EditAnySubmissionComment,
            RolePermissions.DeleteAnySubmissionComment,
            RolePermissions.ModerateSubmissionComments,
        ],
    },
    SubmissionAdminComments: {
        key: 'SubmissionAdminComments',
        name: 'Submission Admin Comments',
        description: 'Submission admin comments permissions',
        permissions: [
            RolePermissions.ViewSubmissionAdminComments,
            RolePermissions.CreateSubmissionAdminComments,
            RolePermissions.EditSubmissionAdminComment,
            RolePermissions.DeleteSubmissionAdminComment,
        ],
    },
};
