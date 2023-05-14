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
                {label: 'Framing', id: 2, parent: "Renovation and construction"},
                {label: 'Plumbing', id: 3, parent: "Renovation and construction"},
                {label: 'Handyman', id: 4, parent: "Renovation and construction"},
                {label: 'Dryall', id: 5, parent: "Renovation and construction"},
                {label: 'Heating', id: 6, parent: "Renovation and construction"},
                {label: 'A/C', id: 7, parent: "Renovation and construction"},
                {label: 'Ventilation', id: 8, parent: "Renovation and construction"},
                {label: 'Electrician', id: 9, parent: "Renovation and construction"},
                {label: 'Hardwood floors', id: 10, parent: "Renovation and construction"},
                {label: 'Roofing', id: 11, parent: "Renovation and construction"},
                {label: 'Appliences repair', id: 12, parent: "Renovation and construction"},
                {label: 'Tile', id: 13, parent: "Renovation and construction"},
                {label: 'Bathroom specialist', id: 14, parent: "Renovation and construction"},
                {label: 'Door installation', id: 15, parent: "Renovation and construction"},
                {label: 'Siding', id: 16, parent: "Renovation and construction"}
            ]
        }
    ];
};
