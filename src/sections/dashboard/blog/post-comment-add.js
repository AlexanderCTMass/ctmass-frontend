import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';

export const PostCommentAdd = ({ onAdd, parentId = null, onCancel, autoFocus = false }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(comment, parentId);
      setComment('');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary" variant="body2">
              Please sign in to leave a comment
            </Typography>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar src={user.avatar || '/assets/avatars/avatar-default.png'} />
              <Box sx={{ flex: 1 }}>
                <TextField
                    fullWidth
                    placeholder={parentId ? "Write a reply..." : "Write a comment..."}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    rows={parentId ? 2 : 3}
                    disabled={isSubmitting}
                    autoFocus={autoFocus}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  {onCancel && (
                      <Button onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                      </Button>
                  )}
                  <Button
                      type="submit"
                      variant="contained"
                      disabled={!comment.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
  );
};