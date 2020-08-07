import qs from 'query-string';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Icon } from '@edx/paragon';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie, Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import H2 from '../../components/H2';
import H3 from '../../components/H3';
import Hero from '../../components/Hero';
import StatusAlert from '../../components/StatusAlert';
import LoadingMessage from '../../components/LoadingMessage';
import EnrollmentsTable from '../EnrollmentsTable';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import EnrolledLearnersForInactiveCoursesTable from '../EnrolledLearnersForInactiveCoursesTable';
import CompletedLearnersTable from '../CompletedLearnersTable';
import PastWeekPassedLearnersTable from '../PastWeekPassedLearnersTable';
import LearnerActivityTable from '../LearnerActivityTable';

import SearchBar from '../SearchBar';
import AdminCards from '../../containers/AdminCards';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp, updateUrl } from '../../utils';

import './Admin.scss';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;
    const queryParams = qs.parse(location.search);
    this.state = {
      searchQuery: queryParams.search,
      enrollmentData: [
          {
            period: '01/07/2020', enrollments: 22,
          },
          {
            period: '07/07/2020', enrollments: 30,
          },
          {
            period: '14/07/2020', enrollments: 35,
          },
          {
            period: '21/07/2020', enrollments: 49,
          },
          {
            period: '28/07/2020', enrollments: 150,
          },
      ],
      gradeData: [
          {
            month: 'Jan', pass: 22, fail:12,
          },
          {
            month: 'Feb', pass: 14, fail:5,
          },
          {
            month: 'Mar', pass: 18, fail:25,
          },
          {
            month: 'Apr', pass: 13, fail:20,
          },
          {
            month: 'May', pass: 34, fail:15,
          },
          {
            month: 'Jun', pass: 20, fail:10,
          },
          {
            month: 'Jul', pass: 5, fail:13,
          },
          {
            month: 'Aug', pass: 7, fail:3,
          },
          {
            month: 'Sep', pass: 13, fail:6,
          },
          {
            month: 'Oct', pass: 25, fail:5,
          },
      ],
      progressData: [
          {
            "name": "In progress",
            "value": 2400
          },
          {
            "name": "Completed",
            "value": 4567
          },
      ],
    };
  }
  componentDidMount() {
    const { enterpriseId } = this.props;
    if (enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId, location } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
    }
    if (location.search !== prevProps.location.search) {
      const { search } = qs.parse(location.search);
      const { search: prevSearch } = qs.parse(prevProps.location.search);
      if (search !== prevSearch) {
        this.handleSearch(search);
      }
    }
  }

  componentWillUnmount() {
    // Clear the overview data
    this.props.clearDashboardAnalytics();
  }

  getMetadataForAction(actionSlug) {
    const { enterpriseId } = this.props;
    const defaultData = {
      title: 'Full Report',
      component: <EnrollmentsTable />,
      csvFetchMethod: () => (
        EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {}, { csv: true })
      ),
      csvButtonId: 'enrollments',
    };

    const actionData = {
      'registered-unenrolled-learners': {
        title: 'Registered Learners Not Yet Enrolled in a Course',
        component: <RegisteredLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchUnenrolledRegisteredLearners(
            enterpriseId,
            {},
            { csv: true },
          )
        ),
        csvButtonId: 'registered-unenrolled-learners',
      },
      'enrolled-learners': {
        title: 'Number of Courses Enrolled by Learners',
        component: <EnrolledLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'enrolled-learners',
      },
      'enrolled-learners-inactive-courses': {
        title: 'Learners Not Enrolled in an Active Course',
        description: 'Learners who have completed all of their courses and/or courses have ended.',
        component: <EnrolledLearnersForInactiveCoursesTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses(
            enterpriseId,
            {},
            { csv: true },
          )
        ),
        csvButtonId: 'enrolled-learners-inactive-courses',
      },
      'learners-active-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Top Active Learners',
        component: <LearnerActivityTable id="learners-active-week" activity="active_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'active_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-active-week',
      },
      'learners-inactive-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Week',
        component: <LearnerActivityTable id="learners-inactive-week" activity="inactive_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'inactive_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-week',
      },
      'learners-inactive-month': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Month',
        component: <LearnerActivityTable id="learners-inactive-month" activity="inactive_past_month" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'inactive_past_month' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-month',
      },
      'completed-learners': {
        title: 'Number of Courses Completed by Learner',
        component: <CompletedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCompletedLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'completed-learners',
      },
      'completed-learners-week': {
        title: 'Number of Courses Completed by Learner',
        subtitle: 'Past Week',
        component: <PastWeekPassedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { passed_date: 'last_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'completed-learners-week',
      },
    };

    return actionData[actionSlug] || defaultData;
  }

  getCsvErrorMessage(id) {
    const { csv } = this.props;
    const csvData = csv && csv[id];
    return csvData && csvData.csvError;
  }

  getTableData(id = 'enrollments') {
    const { table } = this.props;
    const tableData = table && table[id];
    return tableData && tableData.data;
  }

  displaySearchBar() {
    return !this.props.match.params.actionSlug;
  }

  handleSearch(query) {
    this.setState({
      searchQuery: query,
    });
    this.props.searchEnrollmentsList();
  }

  shouldDisableCsvButton(id) {
    const tableData = this.getTableData(id);
    if (!tableData) {
      return true;
    }
    const isTableLoading = tableData.loading;
    const isTableEmpty = tableData.results && !tableData.results.length;
    return isTableLoading || isTableEmpty;
  }

  hasAnalyticsData() {
    const {
      activeLearners,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;

    return [activeLearners, courseCompletions, enrolledLearners, numberOfUsers]
      .some(item => item !== null);
  }

  hasEmptyData() {
    const {
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;

    return [courseCompletions, enrolledLearners, numberOfUsers].every(item => item === 0);
  }

  renderSearchBarDownloadBtnRow() {
    if (this.displaySearchBar()) {
      return (
        <div className="col-12 col-md-12 col-lg-12 col-xl-8 text-md-right">
          <div className="row">
            <div className="col-sm-12 col-md-7 pr-md-0 mb-1">
              {this.renderSearchBar()}
            </div>
            <div className="col-sm-12 col-md-5 pl-md-0">
              {this.renderDownloadButton()}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="col-12 col-md-6 col-lg-12 text-md-right">
        {this.renderDownloadButton()}
      </div>
    );
  }

  renderDownloadButton() {
    const { match } = this.props;
    const { params: { actionSlug } } = match;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    return (
      <DownloadCsvButton
        id={tableMetadata.csvButtonId}
        fetchMethod={tableMetadata.csvFetchMethod}
        disabled={this.shouldDisableCsvButton(actionSlug)}
        buttonLabel={`Download ${actionSlug ? 'current' : 'full'} report (CSV)`}
      />
    );
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title="Unable to load overview"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderCsvErrorMessage(message) {
    return (
      <StatusAlert
        className="mt-3"
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title="Unable to Generate CSV Report"
        message={`Please try again. (${message})`}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="overview mt-3" />;
  }

  renderResetButton() {
    const { match: { url } } = this.props;

    // Remove the slug from the url so it renders the full report
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Link to={path} className="reset btn btn-sm btn-outline-primary ml-3">
        <Icon className="fa fa-undo mr-2" />
        Reset to {this.getMetadataForAction().title}
      </Link>
    );
  }

  renderSearchBar() {
    const { searchQuery } = this.state;
    return (
      <SearchBar
        placeholder="Search by email..."
        onSearch={query => updateUrl({
          search: query,
          page: 1,
        })}
        onClear={() => updateUrl({ search: undefined })}
        value={searchQuery}
      />
    );
  }


  renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
  }) => {

   const RADIAN = Math.PI / 180;
   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
   const x = cx + radius * Math.cos(-midAngle * RADIAN);
   const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="middle">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
  }


  render() {
    const {
      error,
      loading,
      enterpriseId,
      lastUpdatedDate,
      match,
    } = this.props;

    const { params: { actionSlug } } = match;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    const csvErrorMessage = this.getCsvErrorMessage(tableMetadata.csvButtonId);
    const colors = ['#99ccff', '#004080'];

    return (
      <React.Fragment>
        {!loading && !error && !this.hasAnalyticsData() ? this.renderLoadingMessage() : (
          <React.Fragment>
            <main role="main">
              <Helmet title="Learner Progress Report" />
              <Hero title="Learner Progress Report" />
              <div className="container-fluid">
                <div className="row mt-4">
                  <div className="col">
                    <H2>Overview</H2>
                  </div>
                </div>
                <div className="row mt-3">
                  {(error || loading) ? (
                    <div className="col">
                      {error && this.renderErrorMessage()}
                      {loading && this.renderLoadingMessage()}
                    </div>
                  ) : (
                    <AdminCards />
                  )}
                </div>
                <div className="row mt-3">
                  {(error || loading) ? (
                    <div className="col">
                      {error && this.renderErrorMessage()}
                      {loading && this.renderLoadingMessage()}
                    </div>
                  ) : (
                  <BarChart
                    width={450}
                    height={300}
                    data={this.state.gradeData}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pass" fill="#99ccff" />
                  <Bar dataKey="fail" fill="#004080" />
                  </BarChart>
                  )}
                  {(error || loading) ? (
                    <div className="col">
                      {error && this.renderErrorMessage()}
                      {loading && this.renderLoadingMessage()}
                    </div>
                  ) : (
                  <LineChart
                    width={450}
                    height={300}
                    data={this.state.enrollmentData}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" stroke="#004080" activeDot={{ r: 8 }} />
                  </LineChart>
                  )}
                  {(error || loading) ? (
                    <div className="col">
                      {error && this.renderErrorMessage()}
                      {loading && this.renderLoadingMessage()}
                    </div>
                  ) : (
                  <PieChart width={450} height={250}>
                    <text x={225} y={125} textAnchor="middle" dominantBaseline="middle">
                      Progress
                    </text>
                    <Pie
                      data={this.state.progressData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      labelLine={false}
                      label={this.renderCustomizedLabel}>
                      {
                        this.state.progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index]}/>
                        ))
                      }
                    </Pie>
                  </PieChart>
                  )}
                </div>
                <div className="row mt-4">
                  <div className="col">
                    <H2 className="table-title">{tableMetadata.title}</H2>
                    {actionSlug && this.renderResetButton()}
                    {tableMetadata.subtitle && <H3>{tableMetadata.subtitle}</H3>}
                    {tableMetadata.description && <p>{tableMetadata.description}</p>}
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    {!error && !loading && !this.hasEmptyData() && (
                      <div className="row">
                        <div className="col-12 col-md-12 col-lg-12 col-xl-4 pt-1 pb-3">
                          {lastUpdatedDate &&
                            <React.Fragment>
                              Showing data as of {formatTimestamp({ timestamp: lastUpdatedDate })}
                            </React.Fragment>
                          }
                        </div>
                        {this.renderSearchBarDownloadBtnRow()}
                      </div>
                    )}
                    {csvErrorMessage && this.renderCsvErrorMessage(csvErrorMessage)}
                    <div className="mt-3 mb-5">
                      {enterpriseId && tableMetadata.component}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

Admin.defaultProps = {
  error: null,
  loading: false,
  courseCompletions: null,
  activeLearners: null,
  numberOfUsers: null,
  enrolledLearners: null,
  enterpriseId: null,
  lastUpdatedDate: null,
  location: {
    search: null,
  },
  csv: null,
  table: null,
};

Admin.propTypes = {
  fetchDashboardAnalytics: PropTypes.func.isRequired,
  clearDashboardAnalytics: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string,
  searchEnrollmentsList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  activeLearners: PropTypes.shape({
    past_week: PropTypes.number,
    past_month: PropTypes.number,
  }),
  enrolledLearners: PropTypes.number,
  numberOfUsers: PropTypes.number,
  courseCompletions: PropTypes.number,
  lastUpdatedDate: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  csv: PropTypes.shape({}),
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      actionSlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  table: PropTypes.shape({}),
};

export default Admin;
