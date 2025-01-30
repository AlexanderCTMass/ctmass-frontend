const STORAGE_KEY = 'app.project.draft';

class ProjectsLocalApi {
    restoreProject = () => {
        let value = null;

        try {
            const restored = window.localStorage.getItem(STORAGE_KEY);

            if (restored) {
                value = JSON.parse(restored);
            }
        } catch (err) {
            console.error(err);
            // If stored data is not a strigified JSON this will fail,
            // that's why we catch the error
        }

        return value;
    };

    deleteProject = () => {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error(err);
        }
    };

     storeProject = (value) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (err) {
            console.error(err);
        }
    };
}


export const projectsLocalApi = new ProjectsLocalApi();
