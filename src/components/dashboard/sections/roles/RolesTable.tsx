'use client';

import * as Table from '@/components/dashboard/components/Table';
import moment from 'moment';
import Tooltip from '@/components/dashboard/components/Tooltip';
import StringFilter from '../../components/table-parts/StringFilter';
import { useRoles, useUpdateRolesOrderMutation } from '@/lib/roles/hooks';
import ConfirmProtectedLink from '../../components/ConfirmProtectedLink';
import { faArrowRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryState, parseAsString } from 'nuqs';
import { useDrag, useDrop } from 'react-dnd';
import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import styles from './RolesTable.module.scss';
import { useConfirmModal } from '../../modals/confirm-modal/Modal';
import _ from 'lodash';

const roleSorter = (a: any, b: any) => a.order - b.order || a.id - b.id;

function Row({
    role,
    onSwap = () => {},
    reorderMode = false,
    index = 0,
}: {
    role: any;
    onSwap: (from: number, to: number) => void;
    reorderMode: boolean;
    index: number;
}) {
    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: 'role',
            canDrop: () => {
                return reorderMode;
            },
            drop: (item: { id: string; index: number }) => {
                onSwap(item.index, index);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }),
        [reorderMode, index]
    );
    const [collected, drag] = useDrag(
        () => ({
            type: 'role',
            item: { id: role.id, index },
            canDrag: (item) => {
                return reorderMode;
            },
        }),
        [reorderMode, index]
    );

    return (
        <Table.Row
            key={role.id}
            ref={(r) => {
                drop(r);
                drag(r);
                return () => {
                    drop(null);
                    drag(null);
                };
            }}
            {...(collected as object)}
            className={classNames({
                [styles.IsOver]: isOver,
            })}
        >
            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/roles/${role.id}`}
                    className={styles.Role}
                >
                    <span>{role.id}</span>
                </ConfirmProtectedLink>
            </Table.Cell>
            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/roles/${role.id}`}
                    className={styles.Role}
                >
                    <span style={{ color: role.color }}>{role.name}</span>
                </ConfirmProtectedLink>
            </Table.Cell>

            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/users?roles=${role.id}`}
                    className={styles.Role}
                >
                    <span>{role.usersCount || 0}</span>{' '}
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                </ConfirmProtectedLink>
            </Table.Cell>
            <Table.Cell>
                <span>{role.deletable ? 'Yes' : 'No'}</span>
            </Table.Cell>
            <Table.Cell>
                <Tooltip
                    info={moment(role.updatedAt).format(
                        'DD/MM/YYYY [at] HH:mm:ss'
                    )}
                >
                    <span>{moment(role.updatedAt).fromNow()}</span>
                </Tooltip>
            </Table.Cell>
        </Table.Row>
    );
}

export default function RolesTable() {
    const { update, isOpen } = useConfirmModal();

    const [reorder, setReorder] = useState({
        active: false,
        old: [] as any[],
        new: [] as any[],
        difference: [] as any[],
    });
    const { trigger, isMutating } = useUpdateRolesOrderMutation();

    const [, drop] = useDrop(
        () => ({
            accept: 'role',
            options: {
                dropEffect: 'move',
            },
            canDrop: () => {
                return reorder.active;
            },
            drop: (item: { id: string; index: number }) => {
                onSwap(item.index, 0);
            },
        }),
        [reorder.active]
    );

    const [filterName, setFilterName] = useQueryState(
        'name',
        parseAsString.withDefault('')
    );
    const { data: roles, isValidating } = useRoles({
        filter: filterName,
    });

    const onSwap = (fromIndex: number, toIndex: number) => {
        let newRoles = _.cloneDeep(reorder.new);
        const [removed] = newRoles.splice(fromIndex, 1);
        newRoles.splice(toIndex, 0, removed);
        newRoles = newRoles.map((role, index) => ({
            ...role,
            order: index,
        }));

        const difference = newRoles.filter((role, index) => {
            const oldRole = reorder.old.find((r) => r.id === role.id);
            return role.order !== oldRole?.order;
        });

        setReorder({
            ...reorder,
            new: newRoles,
            difference,
        });
    };

    const cancelReorder = useCallback(() => {
        setReorder({
            old: [],
            new: [],
            difference: [],
            active: false,
        });
    }, [setReorder]);

    const confirmReorder = useCallback(() => {
        if (reorder.difference?.length) {
            trigger(
                reorder.difference.map((role) => ({
                    id: role.id,
                    order: role.order,
                }))
            ).then(() => {
                setReorder((r) => ({
                    ...r,
                    difference: [],
                    active: false,
                }));
            });
        } else {
            cancelReorder();
        }
    }, [reorder.difference, trigger, cancelReorder]);

    useEffect(() => {
        update({
            onConfirm: confirmReorder,
            onCancel: cancelReorder,
            isOpen: reorder.active,
            isLoading: isMutating,
        });
    }, [update, confirmReorder, isMutating, cancelReorder, reorder.active]);

    useEffect(() => {
        return () => {
            update({
                onConfirm: null,
                onCancel: null,
                isOpen: false,
            });
        };
    }, [update]);

    const rolesToDisplay = reorder.active
        ? reorder.new.map((r) => r.role)
        : roles;

    return (
        <div className="flex flex-col gap-4 w-full p-8">
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Roles</h1>
                </div>
                <div className="flex flex-row gap-2">
                    <span
                        onClick={() => {
                            if (isOpen) {
                                return update({
                                    isShaking: true,
                                });
                            }
                            const snapshot = roles
                                .map((role) => ({
                                    id: role.id,
                                    order: role.order,
                                    role,
                                }))
                                .sort(roleSorter);
                            setReorder({
                                active: true,
                                old: snapshot,
                                new: snapshot,
                                difference: [],
                            });
                        }}
                    >
                        Enable reordering
                    </span>
                    <ConfirmProtectedLink href="/dashboard/roles/create">
                        Create Role
                    </ConfirmProtectedLink>
                </div>
            </div>
            <Table.Root>
                <Table.Header>
                    <Table.Row ref={drop as any}>
                        <Table.ColumnHeaderCell style={{ width: '50px' }}>
                            ID
                        </Table.ColumnHeaderCell>
                        <StringFilter
                            onChange={setFilterName}
                            defaultValue={filterName}
                            placeholder="Search by name"
                        >
                            <Table.ColumnHeaderCell
                                withFilter={Boolean(filterName.length)}
                                style={{ width: 'auto' }}
                            >
                                Role
                            </Table.ColumnHeaderCell>
                        </StringFilter>
                        <Table.ColumnHeaderCell style={{ width: '100px' }}>
                            Users
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '50px' }}>
                            Deletable
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '200px' }}>
                            Last update
                        </Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rolesToDisplay?.map((role, index) => (
                        <Row
                            key={role.id}
                            role={role}
                            onSwap={onSwap}
                            reorderMode={reorder.active}
                            index={index}
                        />
                    ))}
                </Table.Body>
            </Table.Root>
        </div>
    );
}
