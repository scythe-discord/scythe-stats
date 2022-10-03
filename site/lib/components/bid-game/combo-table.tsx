import React from 'react';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Checkbox } from 'baseui/checkbox';
import { FactionIcon } from 'lib/components';
import { useStyletron } from 'baseui';
import GQL from 'lib/graphql';

export interface ComboTableRow {
  idx: number;
  factionId: number;
  factionName: string;
  checked: Record<number, boolean>;
}

export function isAllChecked(row: ComboTableRow) {
  return Object.values(row.checked).every((v) => v);
}

export function isAnyChecked(row: ComboTableRow) {
  return Object.values(row.checked).some((v) => v);
}

export default function ComboTable({
  tableData,
  playerMats,
  tableHeaderOnChange,
  rowHeaderOnChange,
  columnHeaderOnChange,
  cellOnChange,
  readonly,
}: {
  tableData: ComboTableRow[];
  playerMats: GQL.PlayerMatsQuery;
  tableHeaderOnChange?: () => void;
  columnHeaderOnChange?: (playerMatId: number) => void;
  rowHeaderOnChange?: (rowIdx: number) => void;
  cellOnChange?: (rowIdx: number, playerMatId: number) => void;
  readonly?: boolean;
}) {
  const [css] = useStyletron();
  const tableIsAllChecked = tableData.every((row) => isAllChecked(row));
  const tableIsAnyChecked = tableData.some((row) => isAnyChecked(row));

  return (
    <TableBuilder data={tableData}>
      <TableBuilderColumn
        overrides={{
          TableHeadCell: {
            style: () => ({
              verticalAlign: 'bottom',
            }),
          },
        }}
        header={
          <Checkbox
            checked={tableIsAllChecked}
            isIndeterminate={tableIsAnyChecked && !tableIsAllChecked}
            onChange={() => {
              tableHeaderOnChange?.();
            }}
            disabled={readonly}
          />
        }
      >
        {(row, idx) => {
          const allChecked = isAllChecked(row);
          const hasChecked = isAnyChecked(row);

          return (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '0 10px',
              })}
            >
              <Checkbox
                checked={allChecked}
                isIndeterminate={hasChecked && !allChecked}
                onChange={
                  rowHeaderOnChange && idx != null
                    ? () => rowHeaderOnChange(idx)
                    : undefined
                }
                disabled={readonly}
              />
              <FactionIcon faction={row.factionName} size={24} />
            </div>
          );
        }}
      </TableBuilderColumn>
      {playerMats.playerMats.map(({ id, abbrev }) => {
        const allChecked = tableData.every(({ checked }) => checked[id]);
        const hasChecked = tableData.some(({ checked }) => checked[id]);
        const header = (
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px 0',
            })}
          >
            {abbrev}.
            <Checkbox
              checked={allChecked}
              isIndeterminate={hasChecked && !allChecked}
              onChange={
                columnHeaderOnChange
                  ? () => columnHeaderOnChange(id)
                  : undefined
              }
              disabled={readonly}
            />
          </div>
        );

        return (
          <TableBuilderColumn header={header}>
            {(row, rowIdx) => {
              return (
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'center',
                  })}
                >
                  <Checkbox
                    checked={row.checked[id]}
                    onChange={
                      cellOnChange && rowIdx != null
                        ? () => {
                            cellOnChange(rowIdx, id);
                          }
                        : undefined
                    }
                    disabled={readonly}
                  />
                </div>
              );
            }}
          </TableBuilderColumn>
        );
      })}
    </TableBuilder>
  );
}
