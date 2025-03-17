'use client';

import { useState } from 'react';
import DashboardLayout from '../Layout';
import styles from './ManageConfigs.module.scss';
import { useConfigs } from '@/lib/configs/hooks';
import DashboardEditConfigModal from '@/components/modals/dashboard/EditConfig';
import DashboardDeleteConfigModal from '@/components/modals/dashboard/DeleteConfig';

function ConfigRow({
    config,
    onEdit,
    onDelete,
}: {
    config: any;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <tr key={config.key}>
            <td className={styles.RowCheckbox}>
                <input type="checkbox" />
            </td>
            <td className={styles.RowKey}>{config.key}</td>
            <td className={styles.RowValue}>
                <span>
                    {config.type}: {config.value}
                </span>
            </td>
            <td className={styles.RowLastUpdated}>
                {new Date(config.updatedAt).toLocaleString()}
            </td>
            <td className={styles.RowActions}>
                <button onClick={onEdit} disabled={!config.editable}>
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    disabled={false && !config.deletable}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}

export default function ManageConfigs() {
    const [configActions, setConfigAction] = useState({
        type: 'none',
        key: null,
    });
    const { data, isLoading, error } = useConfigs();

    return (
        <DashboardLayout.Content>
            <DashboardEditConfigModal
                configKey={
                    configActions.type === 'edit' ? configActions.key : null
                }
                onClose={() => setConfigAction({ type: 'none', key: null })}
                onSave={() => {}}
                onError={() => {}}
            />
            <DashboardDeleteConfigModal
                configKey={
                    configActions.type === 'delete' ? configActions.key : null
                }
                onClose={() => setConfigAction({ type: 'none', key: null })}
                onDelete={() => {}}
                onError={() => {}}
            />
            <table className={styles.Table}>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" />
                        </th>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Last updated at</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={5}>Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={5}>Error loading configs</td>
                        </tr>
                    ) : (
                        data.map((config) => (
                            <ConfigRow
                                key={config.key}
                                config={config}
                                onEdit={() =>
                                    setConfigAction({
                                        type: 'edit',
                                        key: config.key,
                                    })
                                }
                                onDelete={() =>
                                    setConfigAction({
                                        type: 'delete',
                                        key: config.key,
                                    })
                                }
                            />
                        ))
                    )}
                </tbody>
            </table>
        </DashboardLayout.Content>
    );
}
