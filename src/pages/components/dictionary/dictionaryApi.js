import {addDoc, doc, getDoc, writeBatch} from "firebase/firestore";
import {items as specialtiesData} from "src/api/dictionary/data";
import {firestore} from "src/libs/firebase";


const SPECIALTIES_CATEGORIES = 'specialtiesCategories';
const SPECIALTIES = 'specialties';
const SERVICES = 'services';

class DictionaryApi {
    async loadSpecialtiesData() {
        try {
            console.log("Start");
            const collectionReference = firestore.collection(SPECIALTIES_CATEGORIES);

            for (const category of specialtiesData) {
                const categoryDoc = await addDoc(collectionReference, category);

                for (const specialty of category.specialties) {
                    const specialtyRef = await categoryDoc.collection('specialties').add({
                        ...specialty,
                        parent: categoryDoc.id
                    });

                    for (const service of specialty.services) {
                        await specialtyRef.collection('services').add({
                            ...service,
                            parent: specialtyRef.id
                        });
                    }
                }
            }

            console.log("Данные успешно загружены в Firestore!");
        } catch (error) {
            console.error("Ошибка при загрузке данных в Firestore: ", error);
        }
    };


    getSpecialtyMap() {
        const dictionaryRef = doc(firestore, "dictionary", "specialties");
        return getDoc(dictionaryRef);
    }

    async get() {
        const specs = await this.getSpecialtyMap();
        if (specs.exists())
            return specs.data();
        return null;
    }

    async getSpecialityByIds(ids){
        const specialities = await this.get()
        return specialities?.categories?.filter(s => ids.includes(s.id.toString()));
    }

    async getSpecialityById(id) {
        this.get().then(speciality => {
                speciality.categories.map(s => {
                    if (s.id.toString() === id.toString()) {
                        return s;
                    }
                })
            }
        )
    }

    getSpecialityByIdAndSetState(id, setSpec, childId, setChild) {
        this.get().then(speciality => {
                speciality.categories.map(s => {
                        if (s.id.toString() === id.toString()) {
                            setSpec(s)
                            if (childId) {
                                s.childs.map(spicChild => {
                                    if (spicChild.id.toString() === childId.toString()) {
                                        setChild(spicChild)
                                        return;
                                    }
                                })
                            }
                            return;
                        }
                    }
                )
            }
        )
    }

    async addSpecialty(newCategory, categories, setCategories, lastId) {
        const temp = {categories: [...categories, newCategory], lastId: lastId};
        const batch = writeBatch(firestore);
        let userSpecRef = doc(firestore, "dictionary", "specialties");

        batch.set(userSpecRef, temp);
        setCategories(temp.categories)

        await batch.commit();
    }

    async save(category, lastId) {
        const batch = writeBatch(firestore);
        let userSpecRef = doc(firestore, "dictionary", "specialties");

        batch.set(userSpecRef, {categories: category, lastId: lastId});

        await batch.commit();
    }
}

export const
    dictionaryApi = new DictionaryApi();