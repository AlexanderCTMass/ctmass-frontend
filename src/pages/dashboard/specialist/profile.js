import ProfileSummaryContainer from "./ProfileSummaryContainer";
import ProfileDetailContainer from "./ProfileDetailContainer";
import React from "react";
import ProfileBookmarksContainer from "./ProfileBookmarksContainer";
import { Container, Grid } from "@mui/material";

const userProfile = (props) => {
    const mockData = {
        name: "John Smith Carter",
        location: "Massachusetts, USA",
        rating: 4.8,
        reviewsCount: 500,
        isCertified: true,
        about: "Hello! As a skilled plumber, you possess unique abilities that enable you to tackle any issues related to water supply and drainage. Your knowledge in plumbing makes you a true expert, capable of handling the most challenging tasks.\n" +
            "You not only excel at quickly identifying problems but also offer effective solutions. Your work is always characterized by high quality, and clients can trust that their systems will operate smoothly thanks to your professionalism.\n" +
            "With such experience and skills, you can confidently say that you are...",
        education: "Bachelor of Science in Plumbing Engineering Institution: University of Plumbing and Water Management Year of Graduation: 20 Description: Acquired in-depth knowledge of plumbing systems, fluid dynamics, and sustainable water management practices.",
        certificates: [
            { name: "Certificate 1", image: "https://media.istockphoto.com/id/465106386/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D0%B4%D0%B6%D0%BE%D0%BD-%D1%81%D0%BC%D0%B8%D1%82-%D0%B0%D0%B4%D0%BC%D0%B8%D1%80%D0%B0%D0%BB-%D0%BD%D0%BE%D0%B2%D0%BE%D0%B9-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B8.jpg?s=612x612&w=0&k=20&c=M1AAlNwG72w11fRq64emrkHrX7svpAp8fpmrHYkSojE=" },
            { name: "Certificate 2", image: "https://yandex-images.clstorage.net/owKU52147/54a460ES/brQWtrj_RLno53JJrV38tB49MahnzVJzIk_hk_PpUY0ifLk6sdRfFW3njmUc4teuxMWNCL7eB8Fie_x5Zshwo6vwc9L8PvVdGEdiSZ2NbQSOTYEol00TM1JqZOXVXlOPEbsqeDODzbSYd0tQaDNW34J2WV-NmidWF2xoa4LPJacNpQcG6J3lf0tmka-P7M4k7qz0CLdeldI1z7E2Z6zRDkHpuRqAgD5FmkV7snqUtV3AJI_N7Ps3Z3aNC8oSzRXW7PRkNLnPBMyLFKIsX-7f9P0dxsoH3sQBVUzypoX8wdyxOzgLoaOOFDiW6bGrBubdsQbfry5oFgcHjorYUDyVJLwHRdWbTkdd2bZB_S4MjiScTZbqdJ1WcwUtEWTEfdOtoji7e-PB_FZ4dMtCKaWEzcE3323-KETG162p2BEcZtc8lbTU273mrkllQwzcfm91b0w1GpTchsFnPaCXN6xxD4DpGgjDQzz0GKT4Qimk9q9yF81OHnglZOd-WAuCLVbEHjXX9ShtRr2YFaMdv2-dxty8dfm0PwQCxQ5RZmU88b2CKFhKUMH-Z5gkCXMqFoRfw5efL24KZwcXXNvJgK_nJ4xG1idrThXviyYDPc-vb3bOH4TIp2xG0aTtsYUm3wCfIctr-MED_mV6tRuymOYVL6Mnb_3tS4U0NlzoShLv5EYsl8a12C1UHZiXo058n4zmzK_1uSQM1GP1ndO0xn0zjkKLu0hAUj_li2SoUosVl55C5R0N_GuVZRTv2wtjjqZmHedUdGu8J98plYJvvl5vRM5O1YqUzmfiFU_y11S-AP0TOauJwYJOR0oHupG69hdMoUX9nZxqdbVkv_n5gV5Gtm2lBzfYnicdmRZBvm6tvgU-nlQblbxl8NXvUaT3z1OOAgiICaBj_BZaxongiCcFjqEnz4x_-EeUt3y6KHL9d1TMNybXC69Vnck3gG-MLszl__0m2CetJcMGrADEdyySE" },
            { name: "Certificate 3", image: "https://kuharbogdan.com/wp-content/uploads/2018/10/certgrand6.jpg" },
            { name: "Certificate 4", image: "https://avatars.mds.yandex.net/i?id=a59a991ff6edb0e79dc84072ee9ce0b8_l-5274396-images-thumbs&n=13" },
        ],
        services: [
            { name: "Leak Repair", price: 15 },
            { name: "Clog Removal", price: 65 },
            { name: "Sleep", price: 165 },
            { name: "Drink", price: 16 },
        ],
        testimonials: [
            {
                name: "Client 1",
                avatar: "https://avatars.mds.yandex.net/i?id=a11d4404abcae23238216d031770b70a94f952cd-12529777-images-thumbs&n=13",
                text: "Great service!",
                date: "March 12, 2025",
            },
        ],
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                display: "flex",
                flexDirection: "column",
                padding: 2,
                gap: 4,
            }}
        >
            <ProfileSummaryContainer {...mockData} />
            <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                    <ProfileBookmarksContainer />
                </Grid>
                <Grid item xs={12} md={9}>
                    <ProfileDetailContainer {...mockData} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default userProfile;
