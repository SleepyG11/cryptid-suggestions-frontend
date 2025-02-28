export enum RolePermissions {
    Administrator = 2 ** 0,

    ViewLogs = 2 ** 1,

    ManageRoles = 2 ** 3,

    ManageUsers = 2 ** 4,
    ManageUserRoles = 2 ** 5,
    ModerateUsers = 2 ** 6,

    ViewSubmissions = 2 ** 7,
    CreateSubmissions = 2 ** 8,
    EditSubmissions = 2 ** 9,
    DeleteSubmissions = 2 ** 10,
    ManageSubmissions = 2 ** 11,
    VerifySubmissions = 2 ** 12,
    ViewSubmissionsMetadata = 2 ** 13,
    VoteForSubmissions = 2 ** 14,

    ViewSubmissionComments = 2 ** 15,
    CreateSubmissionComments = 2 ** 16,
    EditSubmissionComments = 2 ** 17,
    DeleteSubmissionComments = 2 ** 18,
    ManageSubmissionComments = 2 ** 19,

    ManageWebhooks = 2 ** 20,
    ManageConfig = 2 ** 21,

    AttachFiles = 2 ** 22,
}

export const RolePermissionsDefinition = {
    groups: [
        {
            name: 'Administration',
            description: 'General administration permissions',
            permissions: [
                {
                    name: 'Administrator',
                    description: 'Gives all permissions to the role',
                    value: RolePermissions.Administrator,
                },
                {
                    name: 'View Logs',
                    description: 'View all system logs',
                    value: RolePermissions.ViewLogs,
                },
            ],
        },
        {
            name: 'Roles',
            description: 'General roles permissions',
            permissions: [
                {
                    name: 'Manage Roles',
                    description: 'Allow create, edit and delete roles',
                    value: RolePermissions.ManageRoles,
                },
            ],
        },
        {
            name: 'Users',
            description: 'Permissions related to users',
            permissions: [
                {
                    name: 'Manage Users',
                    description: 'Allow edit users information',
                    value: RolePermissions.ManageUsers,
                },
                {
                    name: 'Manage User Roles',
                    description:
                        'Allow manage users roles (only lower than that role)',
                    value: RolePermissions.ManageUserRoles,
                },
                {
                    name: 'Moderation',
                    description: 'Allow ban/unban users',
                    value: RolePermissions.ModerateUsers,
                },
            ],
        },
        {
            name: 'Submissions',
            description: 'Permissions related to submissions',
            permissions: [
                {
                    name: 'View Submissions',
                    description: 'Allow view public submissions',
                    value: RolePermissions.ViewSubmissions,
                },
                {
                    name: 'View Submissions Metadata',
                    description: 'Allow view submissions metadata',
                    value: RolePermissions.ViewSubmissionsMetadata,
                },
                {
                    name: 'Create Submissions',
                    description: 'Allow create new submissions',
                    value: RolePermissions.CreateSubmissions,
                },
                {
                    name: 'Edit Submissions',
                    description: 'Allow edit own submissions',
                    value: RolePermissions.EditSubmissions,
                },
                {
                    name: 'Delete Submissions',
                    description: 'Allow delete own submissions',
                    value: RolePermissions.DeleteSubmissions,
                },
                {
                    name: 'Vote for Submissions',
                    description: 'Allow leave vote for submissions',
                    value: RolePermissions.VoteForSubmissions,
                },
                {
                    name: 'Manage Submissions',
                    description: 'Allow manage submissions',
                    value: RolePermissions.ManageSubmissions,
                },
                {
                    name: 'Verify Submissions',
                    description: 'Allow verify submissions',
                    value: RolePermissions.VerifySubmissions,
                },
            ],
        },
        {
            name: 'Submission Comments',
            description: 'Permissions related to submission comments',
            permissions: [
                {
                    name: 'View Submission Comments',
                    description: 'Allow view submission comments',
                    value: RolePermissions.ViewSubmissionComments,
                },
                {
                    name: 'Create Submission Comments',
                    description: 'Allow create submission comments',
                    value: RolePermissions.CreateSubmissionComments,
                },
                {
                    name: 'Edit Submission Comments',
                    description: 'Allow edit submission comments',
                    value: RolePermissions.EditSubmissionComments,
                },
                {
                    name: 'Delete Submission Comments',
                    description: 'Allow delete submission comments',
                    value: RolePermissions.DeleteSubmissionComments,
                },
                {
                    name: 'Manage Submission Comments',
                    description: 'Allow manage submission comments',
                    value: RolePermissions.ManageSubmissionComments,
                },
            ],
        },
        {
            name: 'Webhooks',
            description: 'Permissions related to webhooks',
            permissions: [
                {
                    name: 'Manage Webhooks',
                    description: 'Allow manage webhooks',
                    value: RolePermissions.ManageWebhooks,
                },
            ],
        },
        {
            name: 'Config',
            description: 'Permissions related to config',
            permissions: [
                {
                    name: 'Manage Config',
                    description: 'Allow manage config',
                    value: RolePermissions.ManageConfig,
                },
            ],
        },
        {
            name: 'Other',
            description: 'Other permissions',
            permissions: [
                {
                    name: 'Attach Files',
                    description: 'Allow attach files to submissions',
                    value: RolePermissions.AttachFiles,
                },
            ],
        },
    ],
};
