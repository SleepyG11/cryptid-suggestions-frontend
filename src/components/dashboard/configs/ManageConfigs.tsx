'use client';

import { useState } from 'react';
import DashboardLayout from '../Layout';
import styles from './ManageConfigs.module.scss';
import { useConfigs } from '@/lib/configs/hooks';
import DashboardEditConfigModal from '@/components/modals/dashboard/EditConfig';

function ConfigRow({ config, onEdit }: { config: any; onEdit: () => void }) {
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
                <button onClick={onEdit}>Edit</button>
                <button>Delete</button>
            </td>
        </tr>
    );
}

export default function ManageConfigs() {
    const [configKey, setConfigKey] = useState<string | null>(null);
    const { data, isLoading, error } = useConfigs();

    return (
        <DashboardLayout.Content>
            <DashboardEditConfigModal
                configKey={configKey}
                onClose={() => setConfigKey(null)}
                onSave={() => {}}
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
                                onEdit={() => setConfigKey(config.key)}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </DashboardLayout.Content>
    );
}
