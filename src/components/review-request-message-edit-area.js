import SmartTextArea from "src/components/smart-text-ares";
import * as React from "react";
import PropTypes from "prop-types";


export const generateReviewRequestTemplate = (profile) => {
    const templates = [
        `Hello there,\n\nI hope this message finds you well! This is ${profile.name} from ${profile.businessName}, reaching out with a small request. I’ve recently joined CTMASS, a trusted platform that connects professionals like me with clients like you, and I’d love to hear your thoughts about our recent work together.\n\nYour feedback would go a long way in helping me establish my reputation on CTMASS. It only takes a minute to leave a review on my profile, but it would mean the world to my business.\n\nThank you so much for your time and support!\n\nBest regards,\n${profile.name}`,

        `Dear Valued Client,\n\nI’m ${profile.name} from ${profile.businessName}, and I wanted to take a moment to thank you sincerely for choosing us for your project. I’ve recently joined CTMASS, a platform that verifies trusted service providers, and I’d be incredibly grateful if you could share your honest feedback about your experience with us.\n\nLeaving a review on my CTMASS profile not only helps me build credibility but also empowers future clients to make confident decisions. It’s a small step that makes a big difference!\n\nWarm regards,\n${profile.name}`,

        `Hi [Client's Name],\n\nThis is ${profile.name} from ${profile.businessName}. It was a pleasure working with you, and I’d be so appreciative if you could spare a quick moment to share your thoughts on CTMASS, the new platform I’ve joined to connect with clients.\n\nYour honest feedback means a lot as I grow my presence on this trusted professional network—and it’s as simple as a quick note on my profile!\n\nThank you for being so supportive!\n\nSincerely,\n${profile.name}`,

        `Good day!\n\nI’m ${profile.name}, the owner of ${profile.businessName}. I’ve recently started using CTMASS, a platform designed to connect clients with reliable professionals, and I’d be thrilled if you’d consider sharing your experience working with us.\n\nA quick review on my CTMASS profile would make a huge difference as I establish myself on this exciting new platform—and I’d be so grateful for your help.\n\nWith appreciation,\n${profile.name}`,

        `Hello!\n\nThis is ${profile.name} from ${profile.businessName}. I’m excited to let you know I’ve joined CTMASS, a platform that showcases professional services, and I’d love for you to share a few words about our work together on my profile.\n\nYour feedback not only boosts my reputation on this growing network but also helps future clients find the quality service they deserve. It’s a small favor with a big impact!\n\nMany thanks in advance!\n\nKind regards,\n${profile.name}`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};


export const ReviewRequestMessageArea = (props) => {
    const {
        profile, label = "Message", name = "message",
        initialValue,
        error, helperText,
        onTextChange, ...other
    } = props;

    return (
        <SmartTextArea
            label={label}
            initialValue={initialValue}
            name={name}
            onTextChange={onTextChange}
            generate={() => generateReviewRequestTemplate(profile)}
            error={error}
            helperText={helperText}
        />
    )
}

ReviewRequestMessageArea.propTypes = {
    profile: PropTypes.object.isRequired,
    initialValue: PropTypes.string,
    onTextChange: PropTypes.func,
}