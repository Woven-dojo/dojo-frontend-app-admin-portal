import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { ADD_PROGRAMS_TITLE, WARNING_ALERT_TITLE_TEXT } from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { TABLE_HEADERS } from '../CourseSearchResults';

import '../../../../__mocks__/react-instantsearch-dom';
import AddProgramsStep from './AddProgramsStep';
import { renderWithRouter } from '../../test/testUtils';

const defaultProps = {
  subscriptionUUID: 'fakest-uuid',
  enterpriseSlug: 'sluggy',
  subscription: { uuid: 'foo', enterpriseCatalogUuid: 'bar' },
  enterpriseId: 'fancyEnt',
};

const StepperWrapper = (props) => {
  const selectedCourses = [...Array(8).keys()].map(n => `course-${n}`);
  const selectedEmails = [];
  const value = {
    courses: [selectedCourses, () => {}],
    emails: [selectedEmails, () => {}],
    subscription: [{}, () => {}],
  };
  return (
    <BulkEnrollContext.Provider value={value}>
      <AddProgramsStep {...props} />
    </BulkEnrollContext.Provider>
  );
};

describe('AddProgramsStep', () => {
  it('displays a title', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(ADD_PROGRAMS_TITLE)).toBeInTheDocument();
  });
  it('displays a table', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(TABLE_HEADERS.courseName)).toBeInTheDocument();
    expect(screen.getByText(TABLE_HEADERS.courseAvailability)).toBeInTheDocument();
  });
  it('more than max selected courses causes display of warning dialog text', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(WARNING_ALERT_TITLE_TEXT)).toBeInTheDocument();
  });
});
