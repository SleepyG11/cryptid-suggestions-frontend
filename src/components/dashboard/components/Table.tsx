import styles from './Table.module.scss';
import { Tooltip } from 'radix-ui';
import classNames from 'classnames';
import { faFilter } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TableRoot: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
    children,
    className,
    ...props
}) => {
    return (
        <Tooltip.Provider delayDuration={100}>
            <table className={classNames(styles.Root, className)} {...props}>
                {children}
            </table>
        </Tooltip.Provider>
    );
};
TableRoot.displayName = 'Table.Root';
// ------------

const TableHeader: React.FC<
    React.HTMLAttributes<HTMLTableSectionElement> & {
        children: React.ReactNode;
    }
> = ({ children, className, ...props }) => {
    return (
        <thead className={classNames(styles.Header, className)} {...props}>
            {children}
        </thead>
    );
};
const TableColumnHeaderCell: React.FC<
    React.HTMLAttributes<HTMLTableCellElement> & {
        children: React.ReactNode;
        withFilter?: boolean | number;
        // leadingIcon?: React.ReactNode;
        // trailingIcon?: React.ReactNode;
    }
> = ({ children, className, withFilter, ...props }) => {
    return (
        <th
            className={classNames(styles.ColumnHeaderCell, className)}
            {...props}
        >
            <div className={styles.CellContainer}>
                <span className={styles.CellContent}>
                    {children}{' '}
                    {withFilter != null && (
                        <span className="fa-layers fa-fw fa-1x">
                            <FontAwesomeIcon icon={faFilter} opacity={0.5} />
                            {Number(withFilter) > 0 && (
                                <span
                                    className="fa-layers-counter"
                                    style={
                                        {
                                            '--fa-counter-scale': '0.45',
                                        } as React.CSSProperties
                                    }
                                >
                                    {Number(withFilter)}
                                </span>
                            )}
                        </span>
                    )}
                </span>
            </div>
        </th>
    );
};
TableColumnHeaderCell.displayName = 'Table.ColumnHeaderCell';
// ------------

const TableBody: React.FC<
    React.HTMLAttributes<HTMLTableSectionElement> & {
        children: React.ReactNode;
    }
> = ({ children, className, ...props }) => {
    return (
        <tbody className={classNames(styles.Body, className)} {...props}>
            {children}
        </tbody>
    );
};
const TableRow: React.FC<
    React.HTMLAttributes<HTMLTableRowElement> & {
        children: React.ReactNode;
    }
> = ({ children, className, ...props }) => {
    return (
        <tr className={classNames(styles.Row, className)} {...props}>
            {children}
        </tr>
    );
};
const TableCell: React.FC<
    React.HTMLAttributes<HTMLTableCellElement> & {
        children: React.ReactNode;
    }
> = ({ children, className, ...props }) => {
    return (
        <td className={classNames(styles.Cell, className)} {...props}>
            {children}
        </td>
    );
};
TableCell.displayName = 'Table.Cell';

const TableRowHeaderCell: React.FC<
    React.HTMLAttributes<HTMLTableCellElement> & {
        children: React.ReactNode;
    }
> = ({ children, className, ...props }) => {
    return (
        <th className={classNames(styles.RowHeaderCell, className)} {...props}>
            {children}
        </th>
    );
};
export {
    TableRoot as Root,
    TableHeader as Header,
    TableBody as Body,
    TableRow as Row,
    TableCell as Cell,
    TableColumnHeaderCell as ColumnHeaderCell,
    TableRowHeaderCell as RowHeaderCell,
};
