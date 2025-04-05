'use client';

import { useMemo, useRef, useSyncExternalStore } from 'react';
import _ from 'lodash';

export type QueueItem = {
    key: string;

    isLoading: boolean;
    isOpen: boolean;
    isDisabled: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
    setIsDisabled: (isDisabled: boolean) => void;

    onConfirm: () => void;
    onCancel: () => void;
    setCallbacks: (onConfirm: () => void, onCancel: () => void) => void;

    update: (data: {
        isOpen?: boolean;
        isLoading?: boolean;
        isDisabled?: boolean;
        onConfirm?: () => void;
        onCancel?: () => void;
    }) => void;
};

class ConfirmQueue {
    private queue = new Map<string, QueueItem>();
    private listeners: (() => void)[] = [];

    private emptyItem: QueueItem = {
        key: '',
        isLoading: false,
        isOpen: false,
        isDisabled: false,
        setIsLoading: () => {},
        setIsOpen: () => {},
        setIsDisabled: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        setCallbacks: () => {},
        update: () => {},
    };
    private state = {
        isLoading: false,
        isOpen: false,
        isDisabled: false,
        isShaking: false,
        count: 0,
    };

    constructor() {
        this.queue = new Map();
        this.listeners = [];

        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
        this.setIsShaking = this.setIsShaking.bind(this);
        this.isEmpty = this.isEmpty.bind(this);
    }

    triggerListeners() {
        this.listeners.forEach((listener) => listener());
    }
    updateState() {
        const loadingItems = Array.from(this.queue.values()).filter(
            (item) => item.isLoading
        );
        const openItems = Array.from(this.queue.values()).filter(
            (item) => item.isOpen
        );
        const disabledItems = Array.from(this.queue.values()).filter(
            (item) => item.isDisabled
        );

        const newState = {
            isLoading: loadingItems.length > 0,
            isOpen: openItems.length > 0,
            isDisabled: disabledItems.length > 0,
            count: openItems.length,
            isShaking: this.state.isShaking,
        };
        if (!_.isEqual(this.state, newState)) {
            this.state = newState;
        }
        this.triggerListeners();
    }

    private createItem(key: string) {
        if (this.queue.has(key)) {
            throw new Error('This confirm request key already exists');
        }
        const item: QueueItem = {
            key,
            isLoading: false,
            isOpen: false,
            isDisabled: false,
            onConfirm: () => {},
            onCancel: () => {},
            setIsLoading: (isLoading: boolean) => {
                this.queue.set(key, {
                    ...this.queue.get(key)!,
                    isLoading: Boolean(isLoading),
                });
                this.updateState();
            },
            setIsOpen: (isOpen: boolean) => {
                this.queue.set(key, {
                    ...this.queue.get(key)!,
                    isOpen: Boolean(isOpen),
                });
                this.updateState();
            },
            setIsDisabled: (isDisabled: boolean) => {
                this.queue.set(key, {
                    ...this.queue.get(key)!,
                    isDisabled: Boolean(isDisabled),
                });
                this.updateState();
            },
            setCallbacks: (onConfirm: () => void, onCancel: () => void) => {
                this.queue.set(key, {
                    ...this.queue.get(key)!,
                    onConfirm: onConfirm ?? (() => {}),
                    onCancel: onCancel ?? (() => {}),
                });
                this.updateState();
            },
            update: (data: {
                isOpen?: boolean;
                isLoading?: boolean;
                isDisabled?: boolean;
                onConfirm?: () => void;
                onCancel?: () => void;
            }) => {
                const newItem = {
                    ...item,
                    isOpen:
                        data.isOpen !== undefined
                            ? Boolean(data.isOpen)
                            : item.isOpen,
                    isLoading:
                        data.isLoading !== undefined
                            ? Boolean(data.isLoading)
                            : item.isLoading,
                    isDisabled:
                        data.isDisabled !== undefined
                            ? Boolean(data.isDisabled)
                            : item.isDisabled,
                    onConfirm:
                        data.onConfirm !== undefined
                            ? data.onConfirm || item.onConfirm
                            : item.onConfirm,
                    onCancel:
                        data.onCancel !== undefined
                            ? data.onCancel || item.onCancel
                            : item.onCancel,
                };
                if (!_.isEqual(item, newItem)) {
                    this.queue.set(key, newItem);
                    this.updateState();
                }
            },
        };
        this.queue.set(key, item);
        return item;
    }
    private deleteItem(key: string) {
        this.queue.delete(key);
    }

    confirm() {
        if (this.state.isDisabled) return;
        this.queue.forEach((item, key) => {
            item.onConfirm();
        });
        this.triggerListeners();
    }
    cancel() {
        this.queue.forEach((item, key) => {
            item.onCancel();
        });
        this.triggerListeners();
    }
    setIsShaking(isShaking: boolean) {
        this.state = {
            ...this.state,
            isShaking: Boolean(isShaking),
        };
        this.triggerListeners();
    }
    isEmpty(silent: boolean = false) {
        const result = this.state.count === 0;
        if (!result && !silent) this.setIsShaking(true);
        return result;
    }

    useItem(key: string) {
        this.createItem(key);
        return {
            subscribe: (callback: () => void) => {
                this.listeners.push(callback);
                return () => {
                    this.listeners.splice(this.listeners.indexOf(callback), 1);
                    this.deleteItem(key);
                };
            },
            getSnapshot: () => this.queue.get(key)!,
            getServerSnapshot: () => this.emptyItem,
        };
    }
    useState() {
        return {
            subscribe: (callback: () => void) => {
                this.listeners.push(callback);
                return () => {
                    this.listeners.splice(this.listeners.indexOf(callback), 1);
                };
            },
            getSnapshot: () => this.state,
            getServerSnapshot: () => this.state,
        };
    }
}

const queue = new ConfirmQueue();

export function useConfirmState() {
    const state = useRef<ReturnType<typeof queue.useState> | null>(null);
    if (!state.current) {
        state.current = queue.useState();
    }
    const stateSnapshot = useSyncExternalStore(
        state.current.subscribe,
        state.current.getSnapshot,
        state.current.getServerSnapshot
    );

    return {
        ...stateSnapshot,
        isEmpty: queue.isEmpty,
        confirm: queue.confirm,
        cancel: queue.cancel,
        setIsShaking: queue.setIsShaking,
    };
}

export function useConfirmRequest(key: string) {
    const request = useRef<ReturnType<typeof queue.useItem> | null>(null);
    if (!request.current) {
        request.current = queue.useItem(key);
    }
    return useSyncExternalStore(
        request.current.subscribe,
        request.current.getSnapshot,
        request.current.getServerSnapshot
    );
}
export function useConfirmRequestMethods(key: string) {
    const item = useConfirmRequest(key);

    return useMemo(() => {
        return {
            setIsOpen: item.setIsOpen,
            setIsLoading: item.setIsLoading,
            setCallbacks: item.setCallbacks,
            update: item.update,
        };
    }, [item.setIsOpen, item.setIsLoading, item.setCallbacks, item.update]);
}
export function useConfirmRequestState(key: string) {
    const item = useConfirmRequest(key);

    return useMemo(() => {
        return {
            isLoading: item.isLoading,
            isOpen: item.isOpen,
            onConfirm: item.onConfirm,
            onCancel: item.onCancel,
        };
    }, [item.isLoading, item.isOpen, item.onConfirm, item.onCancel]);
}
