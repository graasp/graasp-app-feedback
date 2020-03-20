import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  main: {
    textAlign: 'center',
    margin: theme.spacing.unit,
  },
});

export const StudentView = ({ t, classes, feedback }) => {
  if (!feedback) {
    return null;
  }

  return (
    <Grid container spacing={24}>
      <Grid item xs={12} className={classes.main}>
        <TextField
          key="feedback"
          label={t('Feedback')}
          multiline
          value={feedback}
          margin="normal"
          disabled
          variant="outlined"
          fullWidth
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
  feedback: PropTypes.string,
};

StudentView.defaultProps = {
  feedback: '',
};

const StyledComponent = withStyles(styles)(StudentView);

export default withTranslation()(StyledComponent);
