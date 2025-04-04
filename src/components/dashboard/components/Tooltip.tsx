import { Tooltip as TooltipPrimitive } from 'radix-ui';
import styles from './Tooltip.module.scss';
import classNames from 'classnames';

export default function Tooltip({
    children,
    info,
    open,
    defaultOpen,
    onOpenChange,
    className,
    side = 'top',
    align = 'center',
    ...props
}: TooltipPrimitive.TooltipContentProps & {
    info?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    return (
        <TooltipPrimitive.Root
            open={!!info && open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
        >
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content
                className={classNames(styles.Content, className)}
                {...props}
            >
                {info}
                <TooltipPrimitive.Arrow
                    width={11}
                    height={5}
                    className={styles.Arrow}
                />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Root>
    );
}
