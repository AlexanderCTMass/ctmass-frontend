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
                {
                    label: 'Framing', id: 2, parent: 1,
                    image: 'framing.jpg',
                    services: [
                        {name: 'Installation of frame', id: 121},
                        {name: 'Installation of window', id: 122},
                    ]
                },
                {
                    label: 'Plumbing', id: 3, parent: 1,
                    image: 'plumbing.jpg',
                    services: [
                        {name: 'Installation of plumbing equipment', id: 131},
                        {name: 'Sealing the bath seams', id: 132},
                        {name: 'Dismantling the bath', id: 133},
                        {name: 'Dismantling of the shower cubicle', id: 134},
                        {name: 'Removing the shower curtain', id: 135},
                        {name: 'Dismantling the kitchen sink', id: 136},
                        {name: 'Removing the heated', id: 137},
                        {name: 'Removing the heating radiator', id: 138},
                    ]
                },
                {label: 'Handyman', id: 4, parent: 1, image: 'handyman.jpg'},
                {label: 'Drywall', id: 5, parent: 1, image: 'drywall.jpg'},
                {label: 'Heating', id: 6, parent: 1, image: 'heating.jpg'},
                {label: 'A/C', id: 7, parent: 1, image: 'ac.jpg'},
                {label: 'Ventilation', id: 8, parent: 1, image: 'ventilation.jpg'},
                {label: 'Electrician', id: 9, parent: 1, image: 'Electrician.jpg'},
                {label: 'Hardwood floors', id: 10, parent: 1, image: 'hardwood-floors.jpg'},
                {label: 'Roofing', id: 11, parent: 1, image: 'roofing.jpg'},
                {label: 'Appliences repair', id: 12, parent: 1, image: 'appliences-repair.jpg'},
                {label: 'Tile', id: 13, parent: 1, image: 'tile.jpg'},
                {label: 'Bathroom specialist', id: 14, parent: 1, image: 'Bathroom.jpg'},
                {label: 'Door installation', id: 15, parent: 1, image: 'Door.jpg'},
                {label: 'Siding', id: 16, parent: 1, image: 'Siding.jpg'}
            ]
        },
        {
            label: 'Design', id: 20,
            childs: [
                {label: 'Framing', id: 22, parent: 2},
                {label: 'Plumbing', id: 23, parent: 2},
                {label: 'Handyman', id: 24, parent: 2},
                {label: 'Drywall', id: 26, parent: 2},
                {label: 'Heating', id: 26, parent: 2},
                {label: 'A/C', id: 27, parent: 2},
                {label: 'Ventilation', id: 28, parent: 2},
                {label: 'Electrician', id: 29, parent: 2}
            ]
        },
        {
            label: 'Interrior', id: 30,
            childs: [
                {label: 'Framing', id: 32, parent: 3},
                {label: 'Plumbing', id: 33, parent: 3},
                {label: 'Handyman', id: 34, parent: 3},
                {label: 'Drywall', id: 35, parent: 3},
                {label: 'Heating', id: 36, parent: 3},
                {label: 'A/C', id: 37, parent: 3},
                {label: 'Ventilation', id: 38, parent: 3},
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

    const kinds = useKindOfServices();

    const map = new Map();
    kinds.map((kind) => {
        if (kind.childs) {
            map.set(kind.id, {label: kind.label, id: kind.id, childs: kind.childs.map(child => child.id)});

            kind.childs.map((spec) => {
                if (spec.services) {
                    map.set(spec.id, {
                        label: spec.label,
                        id: spec.id,
                        parent: kind.id,
                        services: spec.services.map(ser => ser.id)
                    });

                    spec.services.map((service) => {
                        map.set(service.id, {name: service.name, id: service.id, parent: spec.id});
                    })
                } else {
                    map.set(spec.id, {label: spec.label, id: spec.id, parent: kind.id});
                }
            })
        } else {
            map.set(kind.id, {label: kind.label, id: kind.id});
        }
    })
    return map;
    /*
        return new Map([
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
                value: {label: 'Drywall', id: 5, parent: 1}
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
            },
            {
                key: 20,
                value: {label: 'Design', id: 20}
            },
            {
                key: 30,
                value: {label: 'Interrior', id: 30}
            },
            {
                key: 131,
                value: {name: 'Installation of plumbing equipment', id: 131},
            },
            {
                key: 132,
                value: {name: 'Sealing the bath seams', id: 132},
            },
            {
                key: 133,
                value: {name: 'Dismantling the bath', id: 133},
            },
            {
                key: 134,
                value: {name: 'Dismantling of the shower cubicle', id: 134},
            },
            {
                key: 135,
                value: {name: 'Removing the shower curtain', id: 135},
            },
            {
                key: 136,
                value: {name: 'Dismantling the kitchen sink', id: 136},
            },
            {
                key: 137,
                value: {name: 'Removing the heated', id: 137},
            },
            {
                key: 138,
                value: {name: 'Removing the heating radiator', id: 138}
            },
        ].map(obj => [obj.key, obj.value]));*/
};
