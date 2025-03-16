'use client';

import useSWR, { SWRConfiguration } from 'swr';
import {
    getPublicConfigs,
    getPublicConfig,
    getConfigs,
    getConfig,
    updateConfig,
} from './actions';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { handleAction } from '../common/actionResponse';
import { useLocalUser } from '../users/hooks';

// --------

export function revalidateConfigs() {
    mutate((key) => {
        if (typeof key === 'string') return key.startsWith('/configs');
        return false;
    });
}

// ---------

export function usePublicConfigs(swrOptions?: SWRConfiguration) {
    return useSWR('/configs/public', () => handleAction(getPublicConfigs()), {
        fallbackData: [],
        ...swrOptions,
    });
}

export function usePublicConfig(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        key ? `/configs/public/${key}` : null,
        () => handleAction(getPublicConfig(key)),
        {
            ...swrOptions,
        }
    );
}

// ---------

export function useConfigs(swrOptions?: SWRConfiguration) {
    return useSWR('/configs/all', () => handleAction(getConfigs()), {
        fallbackData: [],
        ...swrOptions,
    });
}

export function useConfig(key?: string | null, swrOptions?: SWRConfiguration) {
    return useSWR(
        key ? `/configs/all/${key}` : null,
        () => handleAction(getConfig(key!)),
        {
            ...swrOptions,
        }
    );
}

// ---------

export function useUpdateConfigMutation(key?: string | null) {
    return useSWRMutation(
        () => (key != null ? `/configs/all/${key}` : null),
        (_: string, { arg }: { arg: any }) =>
            handleAction(updateConfig(key!, arg)),
        {
            populateCache: false,
            onSuccess: () => {
                revalidateConfigs();
            },
        }
    );
}
