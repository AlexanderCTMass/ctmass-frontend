// import {Autocomplete, CircularProgress, Stack, TextField, Typography} from '@mui/material';
// import PropTypes from 'prop-types';
// import * as React from "react";
// import {useEffect, useState} from "react";
// import {collectionGroup, getDocs} from "firebase/firestore";
// import {firestore} from "src/libs/firebase";
//
//
// export const ServiceAndPriceItem = ({ profile }) => {
//     const [specialties, setSpecialties] = useState([]);
//     const [allServices, setAllServices] = useState([]); // Все услуги
//     const [specialty, setSpecialty] = useState(null);
//     const [services, setServices] = useState([]); // Выбранные услуги
//     const [loading, setLoading] = useState(true);
//
//     const [randomSpec, setRandomSpec] = useState(null);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
//                 const servicesSnapshot = await getDocs(collectionGroup(firestore, "services"));
//
//                 const specialtiesData = specialtiesSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     path: doc.ref.path,
//                     ...doc.data()
//                 }));
//
//                 const servicesData = servicesSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     path: doc.ref.path,
//                     ...doc.data()
//                 }));
//
//                 setSpecialties(specialtiesData);
//                 setRandomSpec(specialtiesData.filter(item=>item.id===profile.specialties[0].specialty)[0])
//                 setAllServices(servicesData); // Сохраняем все услуги
//             } catch (error) {
//                 console.error("Error loading data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchData();
//     }, []);
//
//     useEffect(() => {
//         if (profile) {
//             setSpecialty(profile.specialties || null);
//             setServices(profile.services || []);
//         }
//     }, [profile]);
//
//     const handleSpecialtyChange = (_, newValue) => {
//         setSpecialty(newValue);
//         setServices([]); // Сбрасываем выбранные услуги при смене специальности
//     };
//
//     return (
//         <Stack spacing={3}>
//             <div>
//                 <Typography variant="h6">
//                     Choose a specialty
//                 </Typography>
//             </div>
//
//             {loading ? (
//                 <CircularProgress />
//             ) : (
//                 <Autocomplete
//                     options={specialties}
//                     getOptionLabel={(option) => option.label}
//                     value={randomSpec}
//                     onChange={handleSpecialtyChange}
//                     renderInput={(params) => <TextField {...params} label="Kind of specialty"
//                                                         placeholder="Electrician" />}
//                 />
//             )}
//
//             <div>
//                 <Typography variant="h6">
//                     Select the services you want to offer
//                 </Typography>
//             </div>
//
//             {loading ? (
//                 <CircularProgress />
//             ) : (
//                 <Autocomplete
//                     multiple
//                     options={allServices.filter(service => service.parent === specialty?.[0].specialty)}
//                     getOptionLabel={(option) => option.label}
//                     value={services}
//                     onChange={(_, newValue) => setServices(newValue)}
//                     renderInput={(params) => (
//                         <TextField
//                             {...params}
//                             label="Kind of service"
//                             placeholder="e.g Electrical wiring installation"
//                         />
//                     )}
//                     disabled={!specialty}
//                 />
//             )}
//         </Stack>
//     );
// };
//
// ServiceAndPriceItem.propTypes = {
//     profile: PropTypes.object.isRequired,
// };