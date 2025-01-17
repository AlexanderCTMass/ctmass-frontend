import {
    addDoc,
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc, where,
    writeBatch
} from "firebase/firestore";
import {firestore, storage} from "src/libs/firebase";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import toast from "react-hot-toast";
import {objFromArray} from "src/utils/obj-from-array";
import {v4 as uuidv4} from 'uuid';
import {items as specialtiesData} from './data';

const SPECIALTIES_CATEGORIES = 'specialtiesCategories';
const SPECIALTIES = 'specialties';
const SERVICES = 'services';

class DictionaryApi {
    async loadSpecialtiesData() {


        let categoryCount = 0;
        let specialtyCount = 0;
        let serviceCount = 0;
        try {
            const collectionReference = collection(firestore, SPECIALTIES_CATEGORIES);

            for (const category of specialtiesData) {
                // Проверка на существование категории
                const categoryQuery = query(collectionReference, where("label", "==", category.label));
                const categorySnapshot = await getDocs(categoryQuery);

                let categoryDoc;
                if (categorySnapshot.empty) {
                    categoryDoc = await addDoc(collectionReference, {
                        label: category.label,
                        accepted: true
                    });
                    categoryCount++;
                } else {
                    categoryDoc = categorySnapshot.docs[0];
                }

                const specialtiesCollectionRef = collection(firestore, SPECIALTIES_CATEGORIES, categoryDoc.id, SPECIALTIES);

                for (const specialty of category.specialties) {
                    // Проверка на существование специализации
                    const specialtyQuery = query(specialtiesCollectionRef, where("label", "==", specialty.label));
                    const specialtySnapshot = await getDocs(specialtyQuery);

                    let specialtyRef;
                    if (specialtySnapshot.empty) {
                        specialtyCount++;
                        specialtyRef = await addDoc(specialtiesCollectionRef, {
                            label: specialty.label,
                            description: specialty.description,
                            parent: categoryDoc.id,
                            accepted: true
                        });
                    } else {
                        specialtyRef = specialtySnapshot.docs[0];
                    }

                    const servicesCollectionRef = collection(firestore, SPECIALTIES_CATEGORIES, categoryDoc.id, SPECIALTIES, specialtyRef.id, SERVICES);

                    for (const service of specialty.services) {
                        // Проверка на существование сервиса
                        const serviceQuery = query(servicesCollectionRef, where("label", "==", service.label));
                        const serviceSnapshot = await getDocs(serviceQuery);

                        if (serviceSnapshot.empty) {
                            serviceCount++;
                            await addDoc(servicesCollectionRef, {
                                label: service.label,
                                keywords: service.keywords,
                                parent: specialtyRef.id,
                                accepted: true
                            });
                        }
                    }
                }
            }

            console.log("Data success load to Firestore!");
            console.log("Category new count: " + categoryCount);
            console.log("Specialty new count: " + specialtyCount);
            console.log("Service new count: " + serviceCount);
        } catch (error) {
            console.error("Error on load data to Firestore: ", error);
        }
    }


    async getAllSpecialties() {
        const specialtiesQuery = query(
            collectionGroup(firestore, 'specialties')
        );
        const querySnapshot = await getDocs(specialtiesQuery);
        const map = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        const specialties = {
            byId: {},
            allIds: []
        }
        specialties.byId = objFromArray(map);
        specialties.allIds = Object.keys(specialties.byId);
        return specialties;
    }

    getAllServiceCategorized() {
        return new Promise(async (resolve, reject) => {
            const result = [];
            const categories = await this.getCategories();
            for (let category of categories) {
                const result2 = [];
                const specialties = await this.getSpecialties(category.id);
                for (const spec of specialties) {
                    const services = await this.getServices(category.id, spec.id);
                    result2.push({...spec, services: services});
                }
                result.push({...category, specialties: result2});
            }
            resolve(result);
        });
    }

    getCategories(request) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = []
                const querySnapshot = await getDocs(collection(firestore, "specialtiesCategories"));
                querySnapshot.forEach((doc) => {
                    res.push({...doc.data(), id: doc.id});
                });
                resolve(res);
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    getSpecialties(categoryId) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = []
                if (categoryId) {
                    const subquerySnapshot = await getDocs(collection(firestore, "specialtiesCategories", categoryId, "specialties"));
                    subquerySnapshot.forEach((doc) => {
                        res.push({...doc.data(), id: doc.id});
                    });
                } else {
                    const querySnapshot = await getDocs(query(collectionGroup(firestore, 'specialties')));
                    querySnapshot.forEach((doc) => {
                        res.push({...doc.data(), id: doc.id});
                    });
                }
                resolve(res);
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    getServices(categoryId, specialtyId) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = []
                if (specialtyId) {
                    const subquerySnapshot = await getDocs(collection(firestore, "specialtiesCategories", categoryId, "specialties", specialtyId, "services"));
                    subquerySnapshot.forEach((doc) => {
                        res.push({...doc.data(), id: doc.id});
                    });
                } else {
                    const querySnapshot = await getDocs(query(collectionGroup(firestore, 'services')));
                    querySnapshot.forEach((doc) => {
                        res.push({...doc.data(), id: doc.id});
                    });
                }
                resolve(res);
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }


    addCategory(category) {
        return new Promise(async (resolve, reject) => {
            try {
                const docRef = await addDoc(collection(firestore, "specialtiesCategories"), category);
                resolve({...category, id: docRef.id});
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    updateCategory(category, categoryId) {
        return new Promise(async (resolve, reject) => {
            try {
                const docRef = doc(firestore, "specialtiesCategories", categoryId);
                await updateDoc(docRef, category);

                resolve({...category, id: categoryId});
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    removeCategory(category) {
        return new Promise(async (resolve, reject) => {
            try {
                if (category.img) {
                    this.removeImage(category.img);
                }
                await deleteDoc(doc(firestore, "specialtiesCategories", category.id));
                resolve(category.id);

            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    removeImage(image) {
        return new Promise(async (resolve, reject) => {
            try {
                const imgRef = ref(storage, image);

                deleteObject(imgRef).then(async () => {
                    resolve(true);
                }).catch((error) => {
                    throw error;
                });
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    uploadImage(image) {
        return new Promise(async (resolve, reject) => {
            try {
                if (image) {
                    const storageRef = ref(storage, '/services/' + uuidv4() + image.name);
                    uploadBytes(storageRef, image).then((snapshot) => {
                        getDownloadURL(storageRef).then((url) => {
                            resolve(url);
                            toast.success("Images upload successfully!");
                        })
                    });
                }
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    getCategory(request) {
        return null;
    }

    addSpecialty(specialty) {
        return new Promise(async (resolve, reject) => {
            try {
                const docRef =
                    await addDoc(collection(firestore, "specialtiesCategories", specialty.parent, "specialties"), specialty);

                resolve({...specialty, id: docRef.id});
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    updateSpecialty(specialty, specialtyId) {
        return new Promise(async (resolve, reject) => {
            try {
                const docRef = doc(firestore, "specialtiesCategories", specialty.parent, "specialties", specialtyId);
                await updateDoc(docRef, specialty);

                resolve({...specialty, id: specialtyId});
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    removeSpecialty(specialty) {
        return new Promise(async (resolve, reject) => {
            try {
                await deleteDoc(doc(firestore, "specialtiesCategories", specialty.parent, "specialties", specialty.id));
                resolve(specialty.id);

            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }

    getUserSpecialties() {
        return new Promise(async (resolve, reject) => {
            try {
                const res = [];
                const querySnapshot = await getDocs(query(collectionGroup(firestore, 'userSpecialties')));
                querySnapshot.forEach((doc) => {
                    res.push({...doc.data(), id: doc.id});
                });

                resolve(res);
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }
}

export const dictionaryApi = new DictionaryApi();
