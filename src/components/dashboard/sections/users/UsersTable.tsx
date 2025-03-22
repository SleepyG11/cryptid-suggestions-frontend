'use client';

import { useUsers } from '@/lib/users/hooks';
import * as Table from '@/components/dashboard/components/Table';
import UserCard from '@/components/user/UserCard';
import moment from 'moment';
import Tooltip from '@/components/dashboard/components/Tooltip';
import RolesFilter from '../../components/table-parts/RolesFilter';
import { faArrowRight, faCrown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmProtectedLink from '../../components/ConfirmProtectedLink';
import styles from './UsersTable.module.scss';
import StringFilter from '../../components/table-parts/StringFilter';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';

function Row({ user }: { user: any }) {
    return (
        <Table.Row key={user.id}>
            <Table.Cell>
                <Tooltip info={<>Click to copy as Discord mention</>}>
                    <span
                        onClick={() => {
                            navigator.clipboard.writeText(`<@${user.id}>`);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {user.id}
                    </span>
                </Tooltip>
            </Table.Cell>
            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/users/${user.id}`}
                    className={styles.User}
                >
                    <UserCard.Avatar user={user} size={32} />
                    <UserCard.Username user={user} />{' '}
                    {user.root && (
                        <Tooltip info={<>Root user</>}>
                            <FontAwesomeIcon icon={faCrown} size="sm" />
                        </Tooltip>
                    )}
                </ConfirmProtectedLink>
            </Table.Cell>
            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/roles/${user.roleId}`}
                    className={styles.Role}
                >
                    <UserCard.Role user={user} asTag />
                </ConfirmProtectedLink>
            </Table.Cell>
            <Table.Cell>
                <ConfirmProtectedLink
                    href={`/dashboard/suggestions?users=${user.id}`}
                    className={styles.Suggestions}
                >
                    <span>{user.suggestionsCount || 0}</span>{' '}
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                </ConfirmProtectedLink>
            </Table.Cell>
            <Table.Cell>
                <Tooltip
                    info={moment(user.createdAt).format(
                        'DD/MM/YYYY [at] HH:mm:ss'
                    )}
                >
                    <span>{moment(user.createdAt).fromNow()}</span>
                </Tooltip>
            </Table.Cell>
            <Table.Cell>
                <Tooltip
                    info={moment(user.discordUpdatedAt).format(
                        'DD/MM/YYYY [at] HH:mm:ss'
                    )}
                >
                    <span>{moment(user.discordUpdatedAt).fromNow()}</span>
                </Tooltip>
            </Table.Cell>
        </Table.Row>
    );
}

export default function UsersTable() {
    const [filterUsername, setFilterUsername] = useQueryState(
        'username',
        parseAsString.withDefault('')
    );
    const [filterRoles, setFilterRoles] = useQueryState(
        'roles',
        parseAsArrayOf(parseAsString).withDefault([])
    );
    const { data: users, isLoading } = useUsers({
        roles: filterRoles,
        filter: filterUsername,
    });

    return (
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell style={{ width: '225px' }}>
                        ID
                    </Table.ColumnHeaderCell>
                    <StringFilter
                        onChange={setFilterUsername}
                        defaultValue={filterUsername}
                        placeholder="Search by username"
                    >
                        <Table.ColumnHeaderCell
                            withFilter={Boolean(filterUsername.length)}
                            style={{ width: '300px' }}
                        >
                            Username
                        </Table.ColumnHeaderCell>
                    </StringFilter>
                    <RolesFilter
                        onChange={setFilterRoles}
                        defaultValue={filterRoles}
                    >
                        <Table.ColumnHeaderCell withFilter={filterRoles.length}>
                            <span>Role</span>
                        </Table.ColumnHeaderCell>
                    </RolesFilter>
                    <Table.ColumnHeaderCell style={{ width: '100px' }}>
                        Suggestions
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '200px' }}>
                        First login
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '200px' }}>
                        Last update
                    </Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {users?.map((user) => <Row key={user.id} user={user} />)}
            </Table.Body>
        </Table.Root>
    );
}
