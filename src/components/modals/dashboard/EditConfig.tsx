'use client';

import { useConfig, useUpdateConfigMutation } from '@/lib/configs/hooks';
import { Controller, useForm } from 'react-hook-form';
import Modal from '../Modal';
import { ConfigType } from '@/lib/configs/enums';

function EditConfigInput({
    type,
    value,
    onChange,
}: {
    type: string;
    value: string;
    onChange: (value: any) => void;
}) {
    switch (type) {
        case ConfigType.String:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case ConfigType.Integer:
            return (
                <input
                    type="number"
                    value={value}
                    step={1}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') return onChange(null);
                        const parsed = parseInt(value);
                        if (Number.isNaN(parsed)) return onChange(null);
                        onChange(parsed);
                    }}
                />
            );
        case ConfigType.Float:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') return onChange(null);
                        const parsed = parseFloat(value);
                        if (Number.isNaN(parsed)) return onChange(null);
                        onChange(parsed);
                    }}
                />
            );
        case ConfigType.Boolean:
            return (
                <input
                    type="checkbox"
                    checked={value === 'true'}
                    onChange={(e) => onChange(e.target.checked)}
                />
            );
        case ConfigType.Date:
            return (
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(new Date(e.target.value))}
                />
            );
        default:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
    }
}

export default function DashboardEditConfigModal({
    configKey,
    onClose,
    onError,
    onSave,
}: {
    configKey: string | null;
    onClose: () => void;
    onSave: (value: string) => void;
    onError: (error: any) => void;
}) {
    const { data } = useConfig(configKey);
    const { trigger, isMutating } = useUpdateConfigMutation(configKey);

    const { control, getValues, setValue } = useForm({
        values: {
            value: data?.parsedValue,
        },
        defaultValues: {
            value: '',
        },
    });

    function saveConfig() {
        const values = getValues();
        trigger(values.value)
            .then(() => {
                onSave(values.value);
            })
            .catch((error) => {
                onError(error);
            });
    }

    return (
        <Modal
            isOpen={configKey != null && data}
            onClose={() => {
                if (isMutating) return;
                onClose();
            }}
        >
            <Modal.Header>Edit Config</Modal.Header>
            <Modal.Content>
                <Controller
                    control={control}
                    name="value"
                    render={({ field }) => (
                        <EditConfigInput
                            type={data?.type}
                            {...field}
                            onChange={(value) => {
                                setValue(field.name, value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                });
                            }}
                        />
                    )}
                />
                <button onClick={saveConfig} disabled={isMutating}>
                    {isMutating ? 'Saving...' : 'Save'}
                </button>
            </Modal.Content>
        </Modal>
    );
}
