'use client';

import * as Table from '@/components/dashboard/components/Table';
import moment from 'moment';
import Tooltip from '@/components/dashboard/components/Tooltip';
import styles from './RolesTable.module.scss';
import StringFilter from '../../components/table-parts/StringFilter';
import { useRoles } from '@/lib/roles/hooks';
import ConfirmProtectedLink from '../../components/ConfirmProtectedLink';
import { faArrowRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryState, parseAsString } from 'nuqs';

function Row({ role }: { role: any }) {
    return (
        <Table.Row key={role.id}>
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
    const [filterName, setFilterName] = useQueryState(
        'name',
        parseAsString.withDefault('')
    );
    const { data: roles, isLoading } = useRoles({
        filter: filterName,
    });

    return (
        <Table.Root>
            <Table.Header>
                <Table.Row>
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
                {roles?.map((role) => <Row key={role.id} role={role} />)}
            </Table.Body>
        </Table.Root>
    );
}
