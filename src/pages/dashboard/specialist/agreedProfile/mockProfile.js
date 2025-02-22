import {getImages} from "../../../../utils/getPicsumImages";

export const mockProfile = {
    businessName: "Sander Electrix",
    avatar: "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/avatar%2F0DZ1JEyaRZX4LzPIULjS19h0WdT2-thumbnail.png?alt=media&token=5a7aed7f-fd8c-4d60-ad20-2a1ef90dca9d",
    about: "Hi, I'm a licensed electrician with over [X] years of experience in residential, commercial, and industrial electrical systems. I take pride in delivering top-quality workmanship, ensuring all projects meet safety codes and client expectations.",
    rating: 2,
    reviewCount: 2,
    mainSpecId: "Vc9AEq4sP66EEAGamo3R",
    specialties: [
        {
            specialty: "Vc9AEq4sP66EEAGamo3R",
            name: "Electrician",
            services: [{
                description: "Details about electrician services",
                price: "$100/hour",
                images: getImages(4)
            }]
        }
    ] ,
    education: [
        {
            id: 2,
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
                }]

        }],
    reviews: [
        {
            authorId: 2,
            id: 1,
            date: "2023-10-05T14:48:00.000Z",
            projectId: 7,
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            rating: 5,
            images: [getImages(3)],
            comments: [{
                authorId: 1,
                date: "2023-10-05T14:48:00.000Z",
                text: "thank you",
            },]
        }],
    friends: [
        {
            id: [1, 2],
            type: ["connection"],
        }],
    portfolio: [
        {
            id: 1,
            title: "Mason",
            shortDescription: "Finished laying the wall, ensuring its durability and aesthetic appeal.",
            date: "2023-03-01",
            thumbnail: "https://steamuserimages-a.akamaihd.net/ugc/1785108287816448041/6799244DBA99E5B6EC1DE0254FE2A4173332A883/?imw=512&amp;imh=374&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true",
            images: [
                {
                    id: 1,
                    url: "https://steamuserimages-a.akamaihd.net/ugc/1785108287816448041/6799244DBA99E5B6EC1DE0254FE2A4173332A883/?imw=512&amp;imh=374&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true",
                    likedUserId: [1, 2],
                    comments: [
                        {
                            id: 1,
                            authorId: 1,
                            text: "Шляпа коня Будулая!",
                            timestamp: "2023-03-15T12:00:00Z"
                        }
                    ]
                }
            ]
        }
    ]
}