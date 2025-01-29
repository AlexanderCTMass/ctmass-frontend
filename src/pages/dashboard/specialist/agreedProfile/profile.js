import React, {useState} from "react";
import {Box, Divider,} from "@mui/material";
import ProfileHeader from "./ProfileHeader";
import Portfolio from "./Portfolio";
import Advertisement from "./Advertisement";
import Reviews from "./Reviews";
import About from "./About";
import ServicesAndPrices from "./ServicesAndPrices";
import Education from "./Education";
import CertificatesAndLicencies from "./CertificatesAndLicencies";
import ConnectionsAndFriend from "./ConnectionsAndFriend";

const getPortfolio = (count) => {
    let res = [];
    for (let i = 0; i < count; i++) {
        res.push("https://picsum.photos/200/300?random=" + i);
    }
    return res;
}

// Mock Data
const mockProfile = {
    name: "Sander Electrix",
    location: "Amherst, Mass",
    avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
    rating: "5,0",
    reviewsCount: 541,
    isCertified: true,
    about:
        "Hi, I'm a licensed electrician with over [X] years of experience in residential, commercial, and industrial electrical systems. I take pride in delivering top-quality workmanship, ensuring all projects meet safety codes and client expectations.",
    services: [
        {
            name: "Electrician",
            details: [{
                description: "Details about electrician services",
                price: "$100/hour",
                images: getPortfolio(4)
            },
                {
                    description: "Details about electrician services 2 ",
                    price: "$200/hour",
                    images: getPortfolio(2)
                },
                {
                    description: "Details about electrician services 3",
                    price: "$300/hour",
                    images: []
                },
                {
                    description: "Details about electrician services 4",
                    price: "$400/hour"
                }
            ]
        },
        {
            name: "Plumber",
            details: [{
                description: "Details about plumbing services",
                price: "$120/hour",
            }]
        },
        {
            name: "HVAC",
            details: [{
                description: "Details about HVAC services",
                price: "$150/hour",
                images: []
            }]
        },
    ],
    education: [
        {
            title: "Electrical Technology, Lincoln Technical Institute",
            year: 2009,
            description:
                "Completed comprehensive training in electrical systems, safety regulations, and industry best practices. Gained hands-on experience in residential, commercial, and industrial electrical applications.",
            certificates: ["https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png",
                "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png",
                "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png", "https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png"
            ],
        },
        {
            title: "Electrical Apprenticeship Program",
            year: 2013,
            description: "Hands-on training in electrical installations and safety protocols.",
            certificates: [],
        },
        {
            title: "OSHA Safety Certification",
            year: 2018,
            description: "Certified for workplace safety and hazard management.",
            certificates: [],
        },
    ],
    reviews: [
        {
            author: "Mark Dakasos",
            location: "MA, Amherst",
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            rating: 5,
        },
        {
            author: "Moris Loo",
            location: "MA, Amherst",
            text: "He completed everything efficiently and with great quality. I'm very satisfied.",
            rating: 4.5,
        },
    ],
    friends: [{
        name: "Marun Maran",
        link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
        specName: "Electrician",
        rating: "5,0",
        reviewsCount: 541,
        location: "Amherst, Mass",
        avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
    },
        {
            name: "Fenandes Muchini",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Samokatchik",
            rating: "5,0",
            reviewsCount: 16,
            location: "Philadelphia, Pennsylvania",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        },
        {
            name: "Sidney Crosby",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Hockey player",
            rating: "3,4",
            reviewsCount: 643,
            location: "Boston, Mass",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }],
    portfolio: getPortfolio(9),
};

export default function ProfilePage({isOwnProfile = true}) {
    const [profile, setProfile] = useState(mockProfile);
    const [editMode, setEditMode] = useState(false);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleSave = () => {
        setEditMode(false);
    };

    return (
        <Box sx={{
            maxWidth: "77vw",
            marginLeft: "3%",
            padding: 3,
            display: "flex",
            gap: 3,
            backgroundColor: "white",
            borderRadius: 2
        }}>
            {/* Left Column */}
            <Box flex={2}>
                <ProfileHeader
                    isOwnProfile={true}
                    profile={profile}
                    editMode={editMode}
                    handleEditToggle={handleEditToggle}
                    handleSave={handleSave}
                    setProfile={setProfile}
                />
                <Divider sx={{my: 2, mt: "30px"}}/>

                <About editMode={editMode}
                       profile={profile}
                       setProfile={setProfile}
                />
                <ServicesAndPrices
                    service={profile.services}
                    editMode={editMode}
                />
                <Education education={profile.education} editMode={editMode}/>
                <CertificatesAndLicencies certs={profile.education.flatMap(edu => edu.certificates)}/>
                <ConnectionsAndFriend friends={profile.friends}/>
            </Box>

            {/* Right Column */}
            <Box flex={1} marginLeft="20px">
                <Reviews profile={profile}/>
                <div style={{marginTop: "30px"}}/>
                <Portfolio profile={profile}/>
                <Advertisement profile={profile}/>
            </Box>
        </Box>
    );
}
