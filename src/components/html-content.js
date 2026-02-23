import { Box, Typography } from '@mui/material';

export const HtmlContent = ({ content }) => {
  if (!content) {
    return (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No content available
        </Typography>
    );
  }

  return (
      <Box
          className="post-content"
          sx={{
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 600,
              mb: 3,
              mt: 4,
              '&:first-of-type': {
                mt: 0
              }
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 600,
              mb: 2.5,
              mt: 3.5
            },
            '& h3': {
              fontSize: '1.75rem',
              fontWeight: 600,
              mb: 2,
              mt: 3
            },
            '& h4': {
              fontSize: '1.5rem',
              fontWeight: 600,
              mb: 2,
              mt: 2.5
            },
            '& h5': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mb: 1.5,
              mt: 2
            },
            '& h6': {
              fontSize: '1.1rem',
              fontWeight: 600,
              mb: 1.5,
              mt: 2
            },
            '& p': {
              fontSize: '1rem',
              lineHeight: 1.7,
              mb: 2,
              color: 'text.primary'
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 3,
              display: 'block',
              mx: 'auto'
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
              py: 1.5,
              px: 3,
              my: 2,
              borderRadius: 1,
              fontStyle: 'italic',
              '& p': {
                mb: 0
              }
            },
            '& ul, & ol': {
              pl: 4,
              mb: 2,
              '& li': {
                fontSize: '1rem',
                lineHeight: 1.7,
                mb: 0.5
              }
            },
            '& code': {
              fontFamily: 'monospace',
              bgcolor: 'action.hover',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.9em'
            },
            '& pre': {
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': {
                bgcolor: 'transparent',
                p: 0
              }
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              mb: 2,
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                textAlign: 'left'
              },
              '& th': {
                bgcolor: 'action.hover',
                fontWeight: 600
              }
            },
            '& hr': {
              border: 'none',
              borderTop: '1px solid',
              borderColor: 'divider',
              my: 4
            }
          }}
      >
        {/* Используем dangerouslySetInnerHTML для рендеринга HTML */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Box>
  );
};