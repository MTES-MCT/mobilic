import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
  },
  icon: {
      fontSize: 120
  }
});

export function ActivityCard ({ label, renderIcon, timer }) {
    const classes = useStyles();
    return (
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {label}
            </Typography>
            {renderIcon({
                className: classes.icon
            })}
            <Typography color="textSecondary">
              {timer}
            </Typography>
          </CardContent>
        </Card>
    )
}
