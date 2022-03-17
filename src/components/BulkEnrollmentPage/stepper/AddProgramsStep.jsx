import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import DismissibleCourseWarning from './DismissibleCourseWarning';

import { ADD_PROGRAMS_TITLE, ADD_PROGRAMS_DESCRIPTION } from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

import LmsApiService from '../../../data/services/LmsApiService';
import ProgramTable from '../ProgramTable';

const MAX_PROGRAMS = 7;

const AddProgramsStep = ({
  enterpriseId, enterpriseSlug,
}) => {
  const { programs: [selectedPrograms] } = useContext(BulkEnrollContext);
  const [programsData, setProgramsData] = useState(null);

  const loadPrograms = () => {
    const fetchPrograms = async () => {
      try {
        const response = await LmsApiService.fetchCatalogDetail(enterpriseId);
        setProgramsData(response.data);
      } catch (err) {
        logError(err);
      }
    };
    fetchPrograms();
  };
  useEffect(loadPrograms, []);

  return (
    <>
      <p>{ADD_PROGRAMS_DESCRIPTION}</p>
      <h2>{ADD_PROGRAMS_TITLE}</h2>
      {(selectedPrograms?.length || 0) > MAX_PROGRAMS ? <DismissibleCourseWarning /> : null}
      <ProgramTable
        programs={programsData?.programs}
        enterpriseSlug={enterpriseSlug}
      />
    </>
  );
};

AddProgramsStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    enterpriseCatalogUuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default AddProgramsStep;
