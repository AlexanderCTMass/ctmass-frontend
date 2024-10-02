export const objFromArray = (arr, key = 'id') => arr.reduce((accumulator, current) => {
    accumulator[current[key]] = current;
    return accumulator;
}, {});

export const childsFromArray = (arr, key = 'parent') => arr.reduce((accumulator, current) => {
    if (accumulator[current[key]]) {
        accumulator[current[key]].push(current);
    } else{
        accumulator[current[key]] =[];
        accumulator[current[key]].push(current);
    }
    return accumulator;
}, []);
