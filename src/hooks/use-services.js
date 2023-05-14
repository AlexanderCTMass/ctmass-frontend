export const useServices = () => {
    /*
    todo serivces is editable list on admin panel

    const q = query(collection(firestore, "services"));
    const services = await getDocs(q);

    console.log(services);*/

    return [
        {
            label: "Renovation and construction",
            id: 1,
            items: [
                {label: 'Siding', id: 1},
                {label: 'Framing', id: 2},
                {label: 'Plumbing', id: 3},
                {label: 'Handyman', id: 4},
                {label: 'Dryall', id: 5},
                {label: 'Heating', id: 6},
                {label: 'A/C', id: 7},
                {label: 'Ventilation', id: 8},
                {label: 'Electrician', id: 9},
                {label: 'Hardwood floors', id: 10},
                {label: 'Roofing', id: 11},
                {label: 'Appliences repair', id: 12},
                {label: 'Tile', id: 13},
                {label: 'Bathroom specialist', id: 14},
                {label: 'Door installation', id: 15}
            ]
        }
    ];
};
