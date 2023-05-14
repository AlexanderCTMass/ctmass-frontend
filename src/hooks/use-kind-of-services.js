export const useKindOfServices = () => {
    /*
    todo serivces is editable list on admin panel

    const q = query(collection(firestore, "services"));
    const services = await getDocs(q);

    console.log(services);*/

    return [
        {
            label: 'Renovation and construction', id: 1,
            childs: [
                {label: 'Framing', id: 2, parent: 1},
                {label: 'Plumbing', id: 3, parent: 1},
                {label: 'Handyman', id: 4, parent: 1},
                {label: 'Dryall', id: 5, parent: 1},
                {label: 'Heating', id: 6, parent: 1},
                {label: 'A/C', id: 7, parent: 1},
                {label: 'Ventilation', id: 8, parent: 1},
                {label: 'Electrician', id: 9, parent: 1},
                {label: 'Hardwood floors', id: 10, parent: 1},
                {label: 'Roofing', id: 11, parent: 1},
                {label: 'Appliences repair', id: 12, parent: 1},
                {label: 'Tile', id: 13, parent: 1},
                {label: 'Bathroom specialist', id: 14, parent: 1},
                {label: 'Door installation', id: 15, parent: 1},
                {label: 'Siding', id: 16, parent: 1}
            ]
        },

    ];
};

export const useKindOfServicesMap = () => {
    /*
    todo serivces is editable list on admin panel

    const q = query(collection(firestore, "services"));
    const services = await getDocs(q);

    console.log(services);*/

    return [
        {
            key: 1,
            value: {
                label: 'Renovation and construction',
                id: 1,
                childs: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
            }
        },
        {
            key: 2,
            value: {label: 'Framing', id: 2, parent: 1}
        },
        {
            key: 3,
            value: {label: 'Plumbing', id: 3, parent: 1}
        },
        {
            key: 4,
            value: {label: 'Handyman', id: 4, parent: 1}
        },
        {
            key: 5,
            value: {label: 'Dryall', id: 5, parent: 1}
        },
        {
            key: 6,
            value: {label: 'Heating', id: 6, parent: 1}
        },
        {
            key: 7,
            value: {label: 'A/C', id: 7, parent: 1}
        },
        {
            key: 8,
            value: {label: 'Ventilation', id: 8, parent: 1}
        },
        {
            key: 9,
            value: {label: 'Electrician', id: 9, parent: 1}
        },
        {
            key: 10,
            value: {label: 'Hardwood floors', id: 10, parent: 1}
        },
        {
            key: 11,
            value: {label: 'Roofing', id: 11, parent: 1}
        },
        {
            key: 12,
            value: {label: 'Appliences repair', id: 12, parent: 1}
        },
        {
            key: 13,
            value: {label: 'Tile', id: 13, parent: 1}
        },
        {
            key: 14,
            value: {label: 'Bathroom specialist', id: 14, parent: 1}
        },
        {
            key: 15,
            value: {label: 'Door installation', id: 15, parent: 1}
        },
        {
            key: 16,
            value: {label: 'Siding', id: 16, parent: 1}
        }
    ];
};
