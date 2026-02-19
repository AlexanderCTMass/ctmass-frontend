import PropTypes from 'prop-types';
import {
    Divider,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FaqSection = ({ items }) => {
    const normalized = Array.isArray(items)
        ? items.filter((item) => item && (item.question || item.answer))
        : [];

    const hasItems = normalized.length > 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <HelpOutlineIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Frequently Asked Questions
                    </Typography>
                </Stack>

                {hasItems ? (
                    <Stack
                        spacing={2.5}
                        divider={<Divider flexItem />}
                    >
                        {normalized.map((item, index) => (
                            <Stack key={`${item.question || 'faq'}-${index}`} spacing={0.75}>
                                {item.question && (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {item.question}
                                    </Typography>
                                )}
                                {item.answer && (
                                    <Typography variant="body2" color="text.secondary">
                                        {item.answer}
                                    </Typography>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        FAQ items have not been added yet.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

FaqSection.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            question: PropTypes.string,
            answer: PropTypes.string
        })
    )
};

FaqSection.defaultProps = {
    items: []
};

export default FaqSection;