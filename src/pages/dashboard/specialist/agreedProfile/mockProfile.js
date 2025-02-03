import {getImages} from "../../../../utils/getPicsumImages";

export const mockProfile = {
    name: "Sander Electrix",
    avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
    about: "Hi, I'm a licensed electrician with over [X] years of experience in residential, commercial, and industrial electrical systems. I take pride in delivering top-quality workmanship, ensuring all projects meet safety codes and client expectations.",
    services: [
        {
            name: "Electrician",
            details: [{
                description: "Details about electrician services",
                price: "$100/hour",
                images: getImages(4)
            }, {
                description: "Details about electrician services 2 ",
                price: "$200/hour",
                images: getImages(2)
            }, {
                description: "Details about electrician services 3",
                price: "$300/hour",
                images: []
            }, {
                description: "Details about electrician services 4",
                price: "$400/hour"
            }]
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
        },],
    education: [
        {
            title: "Electrical Technology, Lincoln Technical Institute",
            year: 2009,
            description: "Completed comprehensive training in electrical systems, safety regulations, and industry best practices. Gained hands-on experience in residential, commercial, and industrial electrical applications.",
            certificates: [
                {
                    id: 'cert-1',
                    name: 'Electrical Safety',
                    url: 'https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png',
                    tags: ['safety1', 'electrical'],
                    uploadedAt: '2023-01-15'
                }, {
                    id: 'cert-2',
                    name: 'OSHA Certification',
                    url: 'https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png',
                    tags: ['safety', 'electrical'],
                    uploadedAt: '2023-02-20'
                }, {
                    id: 'cert-3',
                    name: 'OSHA Certification',
                    url: 'https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png',
                    tags: ['safety', 'OSHA'],
                    uploadedAt: '2023-02-20'
                }, {
                    id: 'cert-4',
                    name: 'OSHA Certification',
                    url: 'https://mintax.kz/wp-content/uploads/2018/12/20101110_pb_gulnar.png',
                    tags: ['safety', 'OSHA'],
                    uploadedAt: '2023-02-20'
                },]

        }, {
            title: "Electrical Apprenticeship Program",
            year: 2013,
            description: "Hands-on training in electrical installations and safety protocols.",
            certificates: [],
        }, {
            title: "OSHA Safety Certification",
            year: 2018,
            description: "Certified for workplace safety and hazard management.",
            // certificates: [],
        },],
    reviews: [
        {
            author: "Mark Dakasos",
            id: 1,
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            location: "MA, Amherst",
            date: "2023-10-05T14:48:00.000Z",
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            image: [getImages(3)],
            comments: {
                authorId: "1",
                date: "2023-10-05T14:48:00.000Z",
                text: "thank you",
                authorAvatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            },
            rating: 5,
        }, {
            author: "Moris Loo",
            id: 12,
            date: "2022-10-05T14:48:00.000Z",
            location: "MA, Amherst",
            text: "He completed everything efficiently and with great quality. I'm very satisfied.",
            image: [getImages(8)],
            rating: 3,
        }, {
            author: "Mark Dakasos",
            id: 123,
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            location: "MA, Amherst",
            date: "2023-11-05T14:48:00.000Z",
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            image: [getImages(3)],
            comments: {
                authorId: "12",
                text: "thank you",
                date: "2023-11-05T14:48:00.000Z",
                authorAvatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            },
            rating: 5,
        }, {
            author: "Moris Loo",
            location: "MA, Amherst",
            id: 112,
            date: "2023-10-01T14:48:00.000Z",
            text: "He completed everything efficiently and with great quality. I'm very satisfied.",
            image: [getImages(8)],
            rating: 4.5,
        }, {
            author: "Mark Dakasos",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            location: "MA, Amherst",
            date: "2023-12-05T14:48:00.000Z",
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            image: [getImages(3)],
            id: 1132,
            comments: {
                authorId: "123",
                date: "2023-15-05T14:48:00.000Z",
                text: "thank you",
                authorAvatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13",
            },
            rating: 5,
        }, {
            author: "Moris Loo",
            id: 1122222,
            date: "2011-10-05T14:48:00.000Z",
            location: "MA, Amherst",
            text: "He completed everything efficiently and with great quality. I'm very satisfied.",
            image: [getImages(8)],
            rating: 4.5,
        },],
    friends: [
        {
            id: 1,
            name: "Marun Maran",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Electrician",
            rating: "5,0",
            reviewsCount: 541,
            type: ["connection"],
            location: "Amherst, Mass",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }, {
            id: 2,
            name: "Fenandes Muchini",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Samokatchik",
            rating: "5,0",
            reviewsCount: 16,
            location: "Philadelphia, Pennsylvania",
            type: ["friend"],
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }, {
            id: 3,
            name: "Sidney Crosby",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Hockey player",
            rating: "3,4",
            reviewsCount: 643,
            location: "Boston, Mass",
            type: ["connection", "friend"],
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }, {
            id: "4",
            name: "Marun Maran",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Electrician",
            rating: "5,0",
            reviewsCount: 541,
            location: "Amherst, Mass",
            type: ["connection", "friend"],
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }, {
            id: "5",
            name: "Fenandes Muchini",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Samokatchik",
            rating: "5,0",
            type: ["connection", "friend"],
            reviewsCount: 16,
            location: "Philadelphia, Pennsylvania",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }, {
            id: "6",
            name: "Sidney Crosby",
            link: "http://localhost:3000/specialist/alexneuro31-ya-ru",
            specName: "Hockey player",
            rating: "3,4",
            type: ["connection", "friend"],
            reviewsCount: 643,
            location: "Boston, Mass",
            avatar: "https://avatars.mds.yandex.net/i?id=cd5425390f62393e573b5807a2eb1bdd_l-4835645-images-thumbs&n=13"
        }],
    portfolio: getImages(10),
}