import _ from 'lodash';
import React, { Component } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import CircularProgress from '@material-ui/core/CircularProgress';
import ConfirmDialog from '../../common/ConfirmDialog';
import {
  deleteAppInstanceResource,
  patchAppInstanceResource,
  postAppInstanceResource,
} from '../../../actions';
import { FEEDBACK } from '../../../config/appInstanceResourceTypes';
import FormDialog from '../../common/FormDialog';
import { showErrorToast } from '../../../utils/toasts';

class Response extends Component {
  state = {
    confirmDialogOpen: false,
    feedbackDialogOpen: false,
  };

  static propTypes = {
    t: PropTypes.func.isRequired,
    activity: PropTypes.bool.isRequired,
    dispatchDeleteAppInstanceResource: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    student: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    feedbackResource: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      data: PropTypes.string,
    }),
  };

  static defaultProps = {
    feedbackResource: {},
  };

  handleToggleConfirmDialog = open => () => {
    this.setState({
      confirmDialogOpen: open,
    });
  };

  handleToggleFeedbackDialog = open => () => {
    this.setState({
      feedbackDialogOpen: open,
    });
  };

  handleConfirmDelete = () => {
    const { dispatchDeleteAppInstanceResource, feedbackResource } = this.props;
    if (!_.isEmpty(feedbackResource)) {
      dispatchDeleteAppInstanceResource(feedbackResource._id);
    }
    this.handleToggleConfirmDialog(false)();
  };

  handleSubmitFeedback = feedback => {
    const {
      student,
      feedbackResource,
      dispatchPostAppInstanceResource,
      dispatchPatchAppInstanceResource,
      dispatchDeleteAppInstanceResource,
    } = this.props;

    const { id } = student;

    if (!id) {
      showErrorToast(
        'Currently we do not support giving feedback to anonymous users.',
      );
    }

    // if the feedback the feedback submitted is an empty string and
    // feedback existed previously, then delete the resource instead
    // of saving an empty string
    if (feedback === '') {
      if (!_.isEmpty(feedbackResource)) {
        dispatchDeleteAppInstanceResource(feedbackResource._id);
      }
      return this.handleToggleFeedbackDialog(false)();
    }

    // if no feedback resource yet, create it, otherwise, update it
    if (_.isEmpty(feedbackResource)) {
      dispatchPostAppInstanceResource({
        data: feedback,
        userId: id,
        type: FEEDBACK,
      });
    } else {
      dispatchPatchAppInstanceResource({
        id: feedbackResource._id,
        data: feedback,
      });
    }
    return this.handleToggleFeedbackDialog(false)();
  };

  renderFeedbackCell() {
    const {
      feedbackResource: { data = '' },
      t,
    } = this.props;
    const { feedbackDialogOpen } = this.state;

    const inputAdornment = (
      <InputAdornment position="end">
        <IconButton
          color="primary"
          onClick={this.handleToggleFeedbackDialog(true)}
        >
          <EditIcon />
        </IconButton>
      </InputAdornment>
    );

    return (
      <>
        <Input
          value={data}
          disabled
          size="small"
          fullWidth
          endAdornment={inputAdornment}
        />
        <FormDialog
          handleClose={this.handleToggleFeedbackDialog(false)}
          title={t('Feedback')}
          text={t('Submit feedback that will be visible to the student.')}
          open={feedbackDialogOpen}
          initialInput={data}
          handleSubmit={this.handleSubmitFeedback}
        />
      </>
    );
  }

  render() {
    const { t, student, activity, feedbackResource } = this.props;

    const { id } = student;

    const { confirmDialogOpen } = this.state;

    return (
      <TableRow key={id}>
        <TableCell>{activity ? <CircularProgress /> : student.name}</TableCell>
        <TableCell>{this.renderFeedbackCell()}</TableCell>
        <TableCell>
          <IconButton
            color="primary"
            onClick={this.handleToggleConfirmDialog(true)}
            disabled={_.isEmpty(feedbackResource)}
          >
            <DeleteIcon />
          </IconButton>
          <ConfirmDialog
            open={confirmDialogOpen}
            title={t('Delete Feedback')}
            text={t(
              'By clicking "Delete", you will be deleting your feedback. This action cannot be undone.',
            )}
            handleClose={this.handleToggleConfirmDialog(false)}
            handleConfirm={this.handleConfirmDelete}
            confirmText={t('Delete')}
            cancelText={t('Cancel')}
          />
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = ({ appInstanceResources, users }, ownProps) => {
  const {
    student: { id },
  } = ownProps;
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === id && type === FEEDBACK;
    },
  );
  return {
    feedbackResource,
    activity: users.activity.length,
  };
};

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Response);

const TranslatedComponent = withTranslation()(ConnectedComponent);

export default TranslatedComponent;