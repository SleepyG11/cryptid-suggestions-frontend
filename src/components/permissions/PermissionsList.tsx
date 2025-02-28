import styles from './PermissionsList.module.scss';

export function Item({
    permissionDefinition,
    permissions,
}: {
    permissionDefinition: any;
    permissions: any;
}) {
    return (
        <div className={styles.Item}>
            <div className={styles.ItemInfo}>
                <span className={styles.Name}>{permissionDefinition.name}</span>
                <span className={styles.Description}>
                    {permissionDefinition.description}
                </span>
            </div>
            <label className={styles.Switch}>
                <input
                    type="checkbox"
                    checked={
                        (BigInt(permissions) &
                            BigInt(permissionDefinition.value)) !==
                        BigInt(0)
                    }
                    readOnly={true}
                />
                <span className={styles.Slider}></span>
            </label>
        </div>
    );
}

export function Group({
    permissions,
    groupDefinition,
}: {
    permissions: any;
    groupDefinition: any;
}) {
    return (
        <div className={styles.Group}>
            <h3 className={styles.Name}>{groupDefinition.name}</h3>
            <p className={styles.Description}>{groupDefinition.description}</p>
            <div className={styles.Items}>
                {groupDefinition.permissions.map((permission: any) => (
                    <Item
                        key={permission.value}
                        permissionDefinition={permission}
                        permissions={permissions}
                    />
                ))}
            </div>
        </div>
    );
}
export default function PermissionsList({
    permissions,
    definition,
}: {
    permissions: any;
    definition: any;
}) {
    return (
        <div className={styles.List}>
            {definition.groups.map((group: any) => (
                <Group
                    key={group.name}
                    groupDefinition={group}
                    permissions={permissions}
                />
            ))}
        </div>
    );
}
