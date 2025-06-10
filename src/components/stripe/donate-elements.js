import {Elements} from "@stripe/react-stripe-js";
import DonateForm from "src/components/stripe/donate-form";
import {loadStripe} from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const DonateElements = ({amount, onClose, onSuccess}) => {

    return (
        <Elements stripe={stripePromise}>
            <DonateForm amount={amount} onClose={onClose} onSuccess={onSuccess}/>
        </Elements>
    )
}
export default DonateElements;