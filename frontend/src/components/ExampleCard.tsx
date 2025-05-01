import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import useThemeStyles from '../hooks/useThemeStyles';

interface ExampleCardProps {
  title: string;
  description: string;
  onAction: () => void;
}

const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  description,
  onAction,
}) => {
  const styles = useThemeStyles();

  return (
    <Card sx={styles.card}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Box sx={{ p: 2, width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={onAction}
            sx={styles.button}
          >
            Take Action
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ExampleCard;
