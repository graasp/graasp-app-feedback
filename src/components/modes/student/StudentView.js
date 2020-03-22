import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {
  PanTool as PanToolIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';
import { connect } from 'react-redux';
import { showErrorToast } from '../../../utils/toasts';
import { FEEDBACK, REQUEST } from '../../../config/appInstanceResourceTypes';
import {
  deleteAppInstanceResource,
  patchAppInstanceResource,
  postAppInstanceResource,
} from '../../../actions';

const styles = theme => ({
  main: {
    textAlign: 'center',
    margin: theme.spacing(),
  },
});

export const StudentView = ({
  t,
  classes,
  reviewMode,
  feedbackResource,
  requestResource,
  effectiveUserId,
  dispatchPostAppInstanceResource,
  dispatchPatchAppInstanceResource,
  dispatchDeleteAppInstanceResource,
}) => {
  // initial values comes from the saved resources
  const { data: initialFeedback } = feedbackResource;
  const { data: initialRequest } = requestResource;

  const initialValue = reviewMode
    ? initialFeedback
    : initialFeedback || t('You have not received any feedback yet.');

  const [feedback, setFeedback] = React.useState(initialValue);

  const feedbackHasChanged = feedback !== initialFeedback;

  // handle feedback request
  const requestFeedback = () => {
    if (!effectiveUserId) {
      showErrorToast(
        t(
          'Currently we do not support requesting feedback from anonymous users.',
        ),
      );
    }

    if (_.isEmpty(requestResource)) {
      dispatchPostAppInstanceResource({
        data: !initialRequest,
        userId: effectiveUserId,
        type: REQUEST,
      });
    } else {
      dispatchPatchAppInstanceResource({
        id: requestResource._id,
        data: !initialRequest,
      });
    }
  };

  // handle submit feedback
  const save = () => {
    if (!effectiveUserId) {
      showErrorToast(
        t('Currently we do not support giving feedback to anonymous users.'),
      );
    }

    // if the feedback the feedback submitted is an empty string and feedback
    // existed previously, delete the resource instead of saving an empty string
    if (feedback === '' && !_.isEmpty(feedbackResource)) {
      dispatchDeleteAppInstanceResource(feedbackResource._id);
      // if no feedback resource yet, create it, otherwise, update it
    } else if (_.isEmpty(feedbackResource)) {
      dispatchPostAppInstanceResource({
        data: feedback,
        userId: effectiveUserId,
        type: FEEDBACK,
      });
    } else {
      dispatchPatchAppInstanceResource({
        id: feedbackResource._id,
        data: feedback,
      });
    }
  };

  const inputAdornments = [
    <InputAdornment position="end" key="request">
      <Tooltip
        title={initialRequest ? t('Cancel Request') : t('Request Feedback')}
      >
        <IconButton color="primary" onClick={() => requestFeedback()}>
          {initialRequest ? <CancelIcon /> : <PanToolIcon />}
        </IconButton>
      </Tooltip>
    </InputAdornment>,
  ];

  if (reviewMode) {
    inputAdornments.push(
      <InputAdornment position="end" key="save">
        <IconButton
          color="primary"
          onClick={() => save()}
          disabled={!feedbackHasChanged}
        >
          <SaveIcon />
        </IconButton>
      </InputAdornment>,
    );
  }

  return (
    <Grid container spacing={24}>
      <Grid item xs={12} className={classes.main}>
        <TextField
          key="feedback"
          label={t('Feedback')}
          multiline
          value={feedback}
          placeholder={reviewMode && t('You have not given any feedback yet.')}
          margin="normal"
          disabled={!reviewMode}
          onChange={event => setFeedback(event.target.value)}
          variant="outlined"
          fullWidth
          InputProps={{
            endAdornment: inputAdornments,
          }}
        />
      </Grid>
    </Grid>
  );
};

StudentView.propTypes = {
  t: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    main: PropTypes.string,
  }).isRequired,
  feedbackResource: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    data: PropTypes.string,
  }),
  requestResource: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    data: PropTypes.bool,
  }),
  effectiveUserId: PropTypes.string.isRequired,
  reviewMode: PropTypes.bool.isRequired,
  dispatchPostAppInstanceResource: PropTypes.func.isRequired,
  dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
  dispatchDeleteAppInstanceResource: PropTypes.func.isRequired,
};

StudentView.defaultProps = {
  feedbackResource: {},
  requestResource: {},
};

const mapStateToProps = ({ context, appInstanceResources }) => {
  const { reviewing, userId } = context;

  // default to reviewee id as this takes precedence over user id
  const effectiveUserId = userId;
  return {
    effectiveUserId,
    reviewMode: Boolean(reviewing),
    feedbackResource: appInstanceResources.content.find(({ user, type }) => {
      return user === effectiveUserId && type === FEEDBACK;
    }),
    requestResource: appInstanceResources.content.find(({ user, type }) => {
      return user === effectiveUserId && type === REQUEST;
    }),
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
};

const StyledComponent = withStyles(styles)(StudentView);

const TranslatedComponent = withTranslation()(StyledComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TranslatedComponent);
