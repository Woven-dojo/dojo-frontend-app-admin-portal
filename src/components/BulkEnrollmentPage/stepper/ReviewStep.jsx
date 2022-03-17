import React, { useContext } from 'react';
import { Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { REVIEW_TITLE } from './constants';
import ReviewList from './ReviewList';

const LEARNERS = {
  singular: 'learner',
  plural: 'learners',
  title: 'Learners',
  removal: 'Remove learner',
};

const PROGRAMS = {
  singular: 'program',
  plural: 'programs',
  title: 'Programs',
  removal: 'Remove program',
};

const ReviewStep = ({ returnToLearnerSelection, returnToCourseSelection }) => {
  const {
    emails: [selectedEmails, emailsDispatch],
    programs: [selectedPrograms, programsDispatch],
  } = useContext(BulkEnrollContext);

  return (
    <>
      <p>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        You're almost done! Review your selections and make any final changes before completing enrollment for
        your learners.
      </p>
      <h2 className="mb-4">{REVIEW_TITLE}</h2>
      <Row>
        <ReviewList
          key="courses"
          rows={selectedPrograms}
          accessor="title"
          dispatch={programsDispatch}
          subject={PROGRAMS}
          returnToSelection={returnToCourseSelection}
        />
        <ReviewList
          key="emails"
          rows={selectedEmails}
          accessor="userEmail"
          dispatch={emailsDispatch}
          subject={LEARNERS}
          returnToSelection={returnToLearnerSelection}
        />
      </Row>
    </>
  );
};

ReviewStep.propTypes = {
  /* Function to return to prior step */
  returnToLearnerSelection: PropTypes.func.isRequired,
  returnToCourseSelection: PropTypes.func.isRequired,
};

export default ReviewStep;
