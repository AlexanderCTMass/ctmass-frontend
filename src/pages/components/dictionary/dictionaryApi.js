import {doc, getDoc, writeBatch} from "firebase/firestore";
import {firestore} from "../../../libs/firebase";

class DictionaryApi {
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