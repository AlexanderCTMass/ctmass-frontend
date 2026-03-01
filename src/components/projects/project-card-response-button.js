import PropTypes from 'prop-types';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import * as React from "react";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import { useContextDialog } from "src/hooks/use-context-dialog";
import AlertTriangleIcon from "@untitled-ui/icons-react/build/esm/AlertTriangle";
import { projectsApi } from "src/api/projects";
import toast from "react-hot-toast";
import { isProjectPublished, isProjectSearched, isProjectUnpublished, ProjectStatus } from "src/enums/project-state";
import { projectFlow } from "src/flows/project/project-flow";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { navigateToCurrentWithParams } from "src/utils/navigate";
import { paths } from "src/paths";
import { projectService } from "src/service/project-service";
import { tradesApi } from "src/api/trades";


export const ProjectCardResponseButton = (props) => {
    const { project, user, role, onApply, isSubmitting, setIsSubmitting, ...other } = props;
    const [open, setOpen] = useState(false);
    const [trades, setTrades] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const navigate = useNavigate();

    const loadTrades = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoadingTrades(true);
            const userTrades = await tradesApi.getTradesByUser(user.id);
            setTrades(userTrades);
        } catch (error) {
            console.error('Failed to load trades:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoadingTrades(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (open) {
            loadTrades();
        }
    }, [open, loadTrades]);

    if (!isProjectSearched(project, role)) {
        return null;
    }

    const isMyResponded = role === "contractor" && projectService.getRespondedChatId(project, user);
    if (isMyResponded) {
        return null;
    }

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSelectTrade = async (tradeId) => {
        try {
            setIsSubmitting(true);
            setOpen(false);
            const threadKey = await projectFlow.response(project, user, tradeId);
            navigate(paths.cabinet.projects.find.detail.replace(":projectId", project.id) + "?threadKey=" + threadKey);
        } catch (e) {
            console.log(e);
            toast.error(`Error project response!`)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                color={"success"}
                onClick={handleOpenDialog}
                disabled={isSubmitting}
                startIcon={
                    isSubmitting && (
                        <CircularProgress
                            size={20}
                            color="inherit"
                        />
                    )
                }
            >
                Submit
            </Button>
            <Dialog
                open={open}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Select Trade
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Choose the trade you want to use for this project response
                    </Typography>
                    {loadingTrades ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : trades.length === 0 ? (
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                No trades found. Please create a trade first.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleCloseDialog();
                                    navigate(paths.dashboard.trades.create);
                                }}
                            >
                                Create trade
                            </Button>
                        </Box>
                    ) : trades.filter((trade) => trade.status === 'active').length === 0 ? (
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                You have trades, but none of them are currently active.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleCloseDialog();
                                    navigate(paths.dashboard.trades.index);
                                }}
                            >
                                View Trades
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {trades.filter((trade) => trade.status === 'active').map((trade) => (
                                <ListItem key={trade.id} disablePadding>
                                    <ListItemButton onClick={() => handleSelectTrade(trade.id)}>
                                        <ListItemText
                                            primary={trade.title}
                                            secondary={trade.subtitle || trade.primarySpecialtyLabel}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

ProjectCardResponseButton.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired
};
