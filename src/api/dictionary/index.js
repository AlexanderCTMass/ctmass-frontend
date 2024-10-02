import {
    addDoc,
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import {firestore, storage} from "src/libs/firebase";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import toast from "react-hot-toast";
import {v4 as uuidv4} from 'uuid';

class DictionaryApi {

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
