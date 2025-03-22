'use client';

import { usePublicRoles } from '@/lib/roles/hooks';
import { useState } from 'react';
import { Popover, Checkbox, ScrollArea } from 'radix-ui';
import styles from './RolesFilter.module.scss';
import _ from 'lodash';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/pro-regular-svg-icons';
import UserCard from '@/components/user/UserCard';

export default function RolesFilter({
    children,
    defaultValue = [],
    onChange = () => {},
}: {
    children?: React.ReactNode;
    defaultValue?: string[];
    onChange?: (roles: string[]) => void;
}) {
    const { data: roles } = usePublicRoles();

    const [selectedRoles, setSelectedRoles] = useState<string[]>(defaultValue);
    const [search, setSearch] = useState('');

    function toggleRole(roleId: string) {
        const newSelectedRoles = new Set(selectedRoles);
        if (newSelectedRoles.has(roleId)) {
            newSelectedRoles.delete(roleId);
        } else {
            newSelectedRoles.add(roleId);
        }
        setSelectedRoles(Array.from(newSelectedRoles));
    }

    return (
        <Popover.Root
            onOpenChange={(open) => {
                if (!open) {
                    onChange(selectedRoles);
                    setSearch('');
                }
            }}
        >
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    className={styles.PopoverContent}
                >
                    <div className={styles.SearchContainer}>
                        <input
                            className={styles.SearchInput}
                            type="text"
                            placeholder="Search roles..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            className={styles.ResetButton}
                            onClick={() => {
                                setSelectedRoles([]);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                    <ScrollArea.Root className={styles.ScrollArea}>
                        <ScrollArea.Scrollbar orientation="vertical">
                            <ScrollArea.Thumb />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Viewport
                            className={styles.ScrollAreaViewport}
                        >
                            <div className={styles.Roles}>
                                {roles
                                    ?.filter((role) =>
                                        role.name
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                    )
                                    .map((role) => {
                                        const isSelected =
                                            selectedRoles.includes(
                                                String(role.id)
                                            );
                                        return (
                                            <label
                                                key={role.id}
                                                className={classNames(
                                                    styles.Role,
                                                    {
                                                        [styles.Selected]:
                                                            isSelected,
                                                    }
                                                )}
                                            >
                                                <Checkbox.Root
                                                    className={styles.Checkbox}
                                                    checked={isSelected}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        toggleRole(
                                                            String(role.id)
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            isSelected
                                                                ? faSquareCheck
                                                                : faSquare
                                                        }
                                                    />
                                                </Checkbox.Root>
                                                <UserCard.Role
                                                    user={{ role }}
                                                    asTag
                                                    size="sm"
                                                />
                                                {/* <span
                                                style={{
                                                    color: role.color,
                                                    backgroundColor:
                                                        role.color + '40',
                                                }}
                                                className={styles.RoleLabel}
                                            >
                                                {role.name}
                                            </span> */}
                                            </label>
                                        );
                                    })}
                            </div>
                        </ScrollArea.Viewport>
                    </ScrollArea.Root>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
