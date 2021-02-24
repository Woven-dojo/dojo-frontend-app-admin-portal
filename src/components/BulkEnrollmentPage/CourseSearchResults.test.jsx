import React from 'react';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SearchContext } from '@edx/frontend-enterprise';
import StatusAlert from '../StatusAlert';
import {
  BaseCourseSearchResults, CourseNameCell, FormattedDateCell, NO_DATA_MESSAGE, TABLE_HEADERS,
} from './CourseSearchResults';
import LoadingMessage from '../LoadingMessage';

const mockStore = configureMockStore([thunk]);

// Mocking this connected component so as not to have to mock the algolia Api
jest.mock('@edx/frontend-enterprise', () => ({
  ...jest.requireActual('@edx/frontend-enterprise'),
  SearchPagination: () => <div>PAGINATE ME</div>,
}));

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T04:00:00Z';

const searchResults = {
  nbHits: 1,
  hitsPerPage: 10,
  pageIndex: 10,
  pageCount: 5,
  nbPages: 6,
  hits: [
    {
      title: testCourseName,
      advertised_course_run: {
        key: testCourseRunKey,
        start: testStartDate,
      },
    },
  ],
  page: 3,
};

const searchState = {
  page: 2,
};

const defaultProps = {
  searchResults,
  searchState,
  isSearchStalled: false,
  enterpriseId: 'foo',
  enterpriseSlug: 'fancyCompany',
};

const refinementsFromQueryParams = {};

// eslint-disable-next-line react/prop-types
const CourseSearchWrapper = ({ value = { refinementsFromQueryParams }, props = defaultProps }) => (
  <Provider store={mockStore()}>
    <SearchContext.Provider value={value}>
      <BaseCourseSearchResults
        {...props}
      />
    </SearchContext.Provider>
  </Provider>
);

describe('CourseNameCell', () => {
  const row = {
    original: {
      key: testCourseRunKey,
    },
  };
  const slug = 'sluggy';
  const wrapper = mount(<CourseNameCell value={testCourseName} row={row} enterpriseSlug={slug} />);
  it('correctly formats a link', () => {
    expect(wrapper.find('a').props().href).toEqual(`http://localhost:8734/${slug}/course/${row.original.key}`);
  });
  it('displays the course name', () => {
    expect(wrapper.text()).toEqual(testCourseName);
  });
});

describe('<FormattedDateCell />', () => {
  it('renders a formatted date', () => {
    const wrapper = mount(<FormattedDateCell value={testStartDate} />);
    expect(wrapper.text()).toEqual('Sep 10, 2020');
  });
});

describe('<CourseSearchResults />', () => {
  it('renders search results', () => {
    const wrapper = mount(<CourseSearchWrapper />);

    // Three header columns, one for sorting, one for Course Name, one for Course Run
    const tableHeadercells = wrapper.find('TableHeaderCell');
    expect(tableHeadercells.length).toBe(3);
    expect(tableHeadercells.at(1).prop('Header')).toBe(TABLE_HEADERS.courseName);
    expect(tableHeadercells.at(2).prop('Header')).toBe(TABLE_HEADERS.courseStartDate);

    // Three table cells, one for sorting, one title, one course run
    const tableCells = wrapper.find('TableCell');
    expect(tableCells.length).toBe(3);
    expect(tableCells.at(1).text()).toBe(testCourseName);
    expect(tableCells.at(2).text()).toBe('Sep 10, 2020');
  });
  it('displays search pagination', () => {
    const wrapper = mount(<CourseSearchWrapper />);
    expect(wrapper.text()).toContain('PAGINATE ME');
  });
  it('displays modal on click', () => {
    const wrapper = mount(<CourseSearchWrapper />);

    const dataTable = wrapper.find('DataTable');
    act(() => {
      dataTable.props().bulkActions[0].handleClick();
    });
    wrapper.update();
    const bulkEnrollmentModal = wrapper.find('BulkEnrollmentModal');
    // Use the first toast found as it creates a child Toast as well
    expect(bulkEnrollmentModal.props().open).toBe(true);
  });
  it('displays a toast on success', () => {
    const wrapper = mount(<CourseSearchWrapper />);

    const bulkEnrollmentModal = wrapper.find('BulkEnrollmentModal');
    act(() => {
      bulkEnrollmentModal.props().onSuccess();
    });
    wrapper.update();
    const toast = wrapper.find('Toast');
    // Use the first toast found as it creates a child Toast as well
    expect(toast.at(1).prop('show')).toBe(true);
  });
  it('returns an error message if there\'s an error', () => {
    const errorMsg = 'It did not work';
    const wrapper = mount(<CourseSearchWrapper props={{ ...defaultProps, error: { message: errorMsg } }} />);
    expect(wrapper.text()).toContain(errorMsg);
  });
  it('renders a loading state when loading algolia results', () => {
    const wrapper = mount(<CourseSearchWrapper props={{ ...defaultProps, isSearchStalled: true }} />);
    expect(wrapper.find(LoadingMessage)).toHaveLength(1);
  });
  it('renders a message when there are no results', () => {
    const wrapper = mount(<CourseSearchWrapper
      props={{ ...defaultProps, searchResults: { ...searchResults, nbHits: 0 } }}
    />);
    expect(wrapper.find(StatusAlert)).toHaveLength(1);
    expect(wrapper.text()).toContain(NO_DATA_MESSAGE);
  });
});
