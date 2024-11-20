import {useCallback, useEffect, useState} from 'react';
import {format} from 'date-fns';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    SvgIcon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {customersApi} from 'src/api/customers';
import {useMounted} from 'src/hooks/use-mounted';
import emailjs from '@emailjs/browser';
import {checkActionCode, applyActionCode, sendPasswordResetEmail} from "firebase/auth";
import {useAuth} from "../../../hooks/use-auth";
import toast from "react-hot-toast";
import {emailSender} from "../../../libs/email-sender";

const emailOptions = [
    'Send password reset',
    'Send hello'
];

const useEmails = () => {
    const isMounted = useMounted();
    const [emails, setEmails] = useState([]);

    const handleEmailsGet = useCallback(async () => {
        try {
            const response = await customersApi.getEmails();

            if (isMounted()) {
                setEmails(response);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
            handleEmailsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return emails;
};

export const CustomerEmailsSummary = (props) => {
    const {customer} = props;
    const {sendPasswordResetEmail, user} = useAuth();
    const [emailOption, setEmailOption] = useState(emailOptions[0]);
    // const emails = useEmails();


    const sendEmail = () => {
        switch (emailOption) {
            case 'Send password reset':
                sendPasswordResetEmail(customer.email).then(async () => {
                    const email = {
                        "description": "Password reset",
                        "createdAt": new Date().getTime()
                    };
                    await customersApi.addEmail(customer.id, email);
                    const emailActions = customer.emailActions;
                    emailActions.push(email);
                    customer.emailActions = emailActions;
                    toast.success("Mail send successfully!");
                }).catch((error) => {
                    toast.error("Error mail send!");
                    console.error(error);
                });
                break;
            case 'Send hello':
                emailSender.sendHello(customer.email, user).then(() => {
                    toast.success("Mail send successfully!");
                }).catch((error) => {
                    toast.error("Error mail send!");
                    console.error(error);
                });
                break;
        }
    };
    return (
        <Card {...props}>
            <CardHeader title="Emails"/>
            <CardContent sx={{pt: 0}}>
                <TextField
                    name="option"
                    onChange={(event) => setEmailOption(event.target.value)}
                    select
                    SelectProps={{native: true}}
                    sx={{
                        width: 320,
                        maxWidth: '100%'
                    }}
                    variant="outlined"
                    value={emailOption}
                >
                    {emailOptions.map((option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>
                    ))}
                </TextField>
                <Box sx={{mt: 2}}>
                    <Button
                        endIcon={(
                            <SvgIcon>
                                <ArrowRightIcon/>
                            </SvgIcon>
                        )}
                        variant="contained"
                        onClick={sendEmail}
                    >
                        Send email
                    </Button>
                </Box>
            </CardContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Mail Type
                        </TableCell>
                        <TableCell>
                            Date
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {customer.emailActions && customer.emailActions.map((email) => {
                        const createdAt = format(email.createdAt, 'dd/MM/yyyy | HH:mm');

                        return (
                            <TableRow
                                key={email.id}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {email.description}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {createdAt}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
};
