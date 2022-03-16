import { DataTable } from '@edx/paragon';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PAGE, PAGE_SIZE } from './data/constants';
import { CourseNameCell } from './table/CourseSearchResultsCells';
import { TABLE_HEADERS } from './CourseSearchResults';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from './table/BulkEnrollSelect';

const SelectWithContext = (props) => <BaseSelectWithContext contextKey="programs" {...props} />;
const SelectWithContextHeader = (props) => <BaseSelectWithContextHeader contextKey="programs" {...props} />;

const selectColumn = {
  id: 'selection',
  Header: SelectWithContextHeader,
  Cell: SelectWithContext,
  disableSortBy: true,
};

const ProgramTable = ({ programs, enterpriseSlug }) => {
  const columns = useMemo(() => [
    selectColumn,
    {
      Header: TABLE_HEADERS.courseName,
      accessor: 'title',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value, row }) => <CourseNameCell value={value} row={row} enterpriseSlug={enterpriseSlug} />,
    },
  ], []);

  return (
    <>
      <div className="data-table-selector-column-wrapper">
        <DataTable
          isPaginated
          columns={columns}
          data={programs || []}
          itemCount={programs?.length}
          initialState={{
            pageSize: PAGE_SIZE,
            pageIndex: DEFAULT_PAGE - 1,
          }}
        >
          <DataTable.TableControlBar />
          <DataTable.Table />
          <DataTable.EmptyTable content="No results found" />
          <DataTable.TableFooter />
        </DataTable>
      </div>
    </>
  );
};

ProgramTable.propTypes = {
  /* Function to return to prior step */
  programs: PropTypes.shape([]).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default ProgramTable;
